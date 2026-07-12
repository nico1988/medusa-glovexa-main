# Deployment

Two independently deployed apps:

- **Backend** (Medusa + Postgres + Redis + MeiliSearch) → a single **Google Cloud VM** via `docker-compose.prod.yml`, fronted by **Caddy** (auto‑HTTPS).
- **Storefront** (Next.js 15) → **Cloudflare Workers** via **OpenNext**.

```
users ──▶ Cloudflare (Next.js / OpenNext)
             │  HTTPS (SDK calls)
             ▼
        GCP VM ── Caddy :443 (auto TLS)
                    ├─ backend      :9000  (internal)
                    ├─ postgres     :5432  (internal)
                    ├─ redis        :6379  (internal)
                    └─ meilisearch  :7700  (internal)
```

Only Caddy is exposed publicly. Every other service is private on the compose network and addressed by service name (`postgres`, `redis`, `meilisearch`, `backend`).

---

## 1. Backend on Google Cloud

### 1.1 Provision the VM
- Machine type: `e2-medium` (2 vCPU / 4 GB) is enough with the frontend off‑box.
- OS: Ubuntu 22.04/24.04 LTS.
- Firewall: allow **80**, **443**, **22** only.
- Add **4 GB swap** (safety net for the image build):
  ```bash
  sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
- Install Docker + compose plugin:
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER   # re-login after this
  ```

### 1.2 DNS
Point an A record for your backend domain (e.g. `api.example.com`) at the VM's external IP. Caddy needs this resolvable to issue a TLS cert.

### 1.3 Configure & launch
From the repo root on the VM:
```bash
cp .env.production.template .env
# edit .env: set strong POSTGRES_PASSWORD / MEILI_MASTER_KEY / JWT_SECRET /
# COOKIE_SECRET, and BACKEND_DOMAIN, ACME_EMAIL, STORE_CORS (Cloudflare domain).

docker compose -f docker-compose.prod.yml up -d --build
```
On boot the backend container runs `medusa db:migrate` automatically (see `backend/docker-entrypoint.sh`).

### 1.4 One-time backend setup
```bash
# create an admin user
docker compose -f docker-compose.prod.yml exec backend pnpm exec medusa user -e admin@example.com -p 'a-strong-password' -i admin

# (optional) seed data
docker compose -f docker-compose.prod.yml exec backend pnpm exec medusa exec ./src/scripts/seed.ts
```
Admin dashboard: `https://api.example.com/app`.

> **Publishable key:** in the admin, go to Settings → Publishable API Keys → copy the "Webshop" key. You'll need it for the storefront (`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`).

### 1.5 Updates
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build backend
```

### Notes
- **Redis is auto-enabled**: when `REDIS_URL` is set (it is, in compose), `medusa-config.ts` switches cache / event bus / workflow engine to Redis. Locally (no `REDIS_URL`) it falls back to in-memory, so dev and tests are unaffected.
- **Postgres upgrade path:** for less ops burden, drop the `postgres` service and point `DATABASE_URL` at **Cloud SQL** instead.
- **Backups:** the `pgdata` volume holds your DB. Schedule `pg_dump` (or use Cloud SQL automated backups).

---

## 2. Storefront on Cloudflare

Uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Config lives in `storefront/wrangler.jsonc` and `storefront/open-next.config.ts`.

### 2.1 Install deps
```bash
cd storefront
pnpm install   # pulls in @opennextjs/cloudflare + wrangler
```

### 2.2 Environment variables
`NEXT_PUBLIC_*` are **build-time** (inlined by `next build`). Set them where the build runs:
- **Cloudflare dashboard build** (recommended): Workers & Pages → your project → Settings → Variables & Secrets → **Build**. See `.env.production.template` for the full list. Required: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_BASE_URL`.
- **Local build/deploy:** create `storefront/.env.production` from the template.

### 2.3 Deploy
Three options, pick one:
- **GitHub Actions (recommended, matches the backend):** `.github/workflows/deploy-storefront.yml` — see §4.
- **Cloudflare Git integration:** connect the repo in the Cloudflare dashboard (build command `pnpm cf:build`).
- **From your machine:**
  ```bash
  cd storefront
  pnpm cf:deploy         # builds with OpenNext, then wrangler deploy
  pnpm cf:preview        # preview in the Workers runtime locally first
  ```

### 2.4 Wire the two together
- Storefront `NEXT_PUBLIC_MEDUSA_BACKEND_URL` = `https://api.example.com`.
- Backend `.env` `STORE_CORS` = your Cloudflare storefront origin (e.g. `https://shop.example.com`). Restart the backend after changing CORS.

### Notes
- `next/image`: the backend domain is auto-added to `remotePatterns` from `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, so product images render.
- The 3D/2D editor (three.js / konva) is client-only and doesn't affect the Worker runtime.
- Put the GCP VM in a region close to your users to minimize Cloudflare‑edge → backend latency on SSR.

---

## 3. CI/CD — auto-deploy the backend (GitHub Actions)

`.github/workflows/deploy-backend.yml` triggers on pushes to `main` that touch
`backend/**`, `docker-compose.prod.yml`, or `Caddyfile`. It SSHes into the VM
and has it rebuild the `backend` container from the latest code.

**Where secrets live:** the image is built **on the VM** using the VM's own
`.env`, so app secrets (DB password, JWT, cookie, Meili key) **never enter
GitHub**. GitHub only needs SSH credentials to reach the VM.

### 3.1 Prerequisites on the VM
The repo must already be cloned on the VM and its `.env` filled in (section 1).
```bash
git clone <your-repo> ~/b2b-starter-medusa
cd ~/b2b-starter-medusa && cp .env.production.template .env   # then fill it in
```
> Private repo? Give the VM read access (a GitHub deploy key) so `git pull` works unattended.

### 3.2 Create an SSH key for the deploy
On your machine:
```bash
ssh-keygen -t ed25519 -f deploy_key -N ""       # creates deploy_key + deploy_key.pub
# authorize the public key on the VM:
ssh-copy-id -i deploy_key.pub <user>@<vm-ip>    # or append deploy_key.pub to ~/.ssh/authorized_keys
```

### 3.3 Add GitHub secrets
Repo → Settings → Secrets and variables → Actions → **Secrets**:

| Secret | Value |
|---|---|
| `VM_SSH_HOST` | VM external IP or domain |
| `VM_SSH_USER` | SSH user |
| `VM_SSH_KEY` | contents of the **private** `deploy_key` file |
| `VM_SSH_PORT` | (optional) SSH port; omit for 22 |

And under **Variables** (optional):

| Variable | Value |
|---|---|
| `VM_PROJECT_PATH` | repo path on the VM (default `~/b2b-starter-medusa`) |

### 3.4 How it runs
On each qualifying push (or manual **Run workflow**), the VM executes:
```bash
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build backend
docker image prune -f
```
Migrations run automatically via the container entrypoint. Watch progress in
the Actions tab; check the result on the VM with
`docker compose -f docker-compose.prod.yml logs -f backend`.

---

## 4. CI/CD — auto-deploy the storefront (GitHub Actions)

`.github/workflows/deploy-storefront.yml` triggers on pushes to `main` that
touch `storefront/**`. It builds with OpenNext and deploys to Cloudflare
Workers via wrangler — fully independent of the backend workflow.

**Secrets vs variables:** `NEXT_PUBLIC_*` are baked into the browser bundle, so
they're public → GitHub **Variables**. Only the API token and revalidation
secret are sensitive → GitHub **Secrets**.

### 4.1 Create a Cloudflare API token
Cloudflare dashboard → My Profile → API Tokens → Create Token → use the
**"Edit Cloudflare Workers"** template (scoped to your account). Copy the token.
Also grab your **Account ID** (Workers & Pages → right sidebar).

### 4.2 Add GitHub secrets
Repo → Settings → Secrets and variables → Actions → **Secrets**:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | the token from 4.1 |
| `CLOUDFLARE_ACCOUNT_ID` | your Cloudflare account id |
| `REVALIDATE_SECRET` | Next.js on-demand revalidation secret |

### 4.3 Add GitHub variables
… → Actions → **Variables**:

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://api.example.com` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_...` |
| `NEXT_PUBLIC_BASE_URL` | `https://shop.example.com` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `us` |
| `NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY` | (optional) |
| `NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID` | (optional) |

### 4.4 First deploy
The first `wrangler deploy` creates the Worker named in `storefront/wrangler.jsonc`
(`medusa-storefront`). Afterwards, add your custom domain (e.g.
`shop.example.com`) to that Worker in the Cloudflare dashboard (Workers & Pages
→ the worker → Settings → Domains & Routes), and make sure
`NEXT_PUBLIC_BASE_URL` + the backend's `STORE_CORS` match it.
