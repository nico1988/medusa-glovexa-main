# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Medusa B2B Commerce Starter: a two-app project consisting of a **Medusa 2.x backend** (`backend/`) and a **Next.js 15 storefront** (`storefront/`). The two are **separate npm projects**, not a workspace — each has its own `package.json` and lockfile. Run install/build/dev commands from within each directory. Package manager is `pnpm@9.15.9`; Node >= 20.

Tested against Node 20, Postgres 15, Medusa 2.4+, Next.js 15.

## Commands

### Backend (`cd backend`)
- `pnpm dev` — run Medusa server + admin (`medusa develop`, port 9000, admin at `/app`)
- `pnpm build` / `pnpm start` — production build / start
- `pnpm seed` — seed data (`medusa exec ./src/scripts/seed.ts`)
- `pnpm medusa db:create && pnpm medusa db:migrate` — create/migrate DB
- `pnpm medusa user -e admin@test.com -p supersecret -i admin` — create an admin user
- `npx medusa db:migrate` — apply migrations after changing data models
- Tests (Jest):
  - `pnpm test:unit` — unit tests
  - `pnpm test:integration:http` — HTTP/API integration tests
  - `pnpm test:integration:modules` — module integration tests
  - Run a single test: append a Jest name/path filter, e.g. `pnpm test:integration:http -- -t "creates a company"`

### Storefront (`cd storefront`)
- `pnpm dev` — Next.js dev server on port **8000**
- `pnpm build` / `pnpm start`
- `pnpm lint` — `next lint`
- `pnpm analyze` — bundle analysis build

### First-time setup
Each app has a `.env.template` to copy to `.env`. The storefront needs `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (copy the "Webshop" publishable key from Admin → Settings → Publishable API Keys) and optionally `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (defaults to `http://localhost:9000`).

## Backend Architecture

Built on Medusa 2.x framework primitives. The B2B functionality lives in three **custom modules** registered in `medusa-config.ts`: `company`, `quote`, `approval`. Also configures in-memory cache and workflow engine.

- **Modules** (`src/modules/<name>/`): self-contained business domains. Each has `index.ts` (exports a `Module()` definition + a `*_MODULE` string key), `service.ts` (a class extending `MedusaService({ ...models })` — this auto-generates CRUD and is registered in the DI container under the module key), `models/` (data models via `model.define`), and `migrations/`. Resolve a service in routes via `req.scope.resolve(COMPANY_MODULE)`.

- **Module links** (`src/links/`): `defineLink(...)` connects entities across modules (and to built-in Medusa modules like cart/order/customer) without foreign keys — e.g. `company-carts.ts` links a company to carts. This is the mechanism for associating B2B entities with core commerce entities. After adding/changing links, run `db:migrate`.

- **Workflows** (`src/workflows/<domain>/`): the standard place for multi-step business logic. Split into `steps/` (each a `createStep`, with compensation) and `workflows/` (`createWorkflow` composing steps). Execute from routes/jobs/subscribers via `myWorkflow(req.scope).run({ input })`. Prefer workflows over stuffing logic into route handlers. `hooks/` holds workflow hooks into core Medusa flows.

- **API routes** (`src/api/`): file-based routing. `admin/` and `store/` mirror Medusa's route namespaces. Each route folder typically has `route.ts` (HTTP handlers), `validators.ts` (zod schemas), `query-config.ts` (fields/relations for `query.graph`), and `middlewares.ts`. Route-level middleware is composed in `src/api/middlewares.ts`. Use the `query` graph service (`ContainerRegistrationKeys.QUERY`) to read across linked entities.

- **Admin extensions** (`src/admin/`): customizations to the Medusa admin dashboard (`routes/`, `components/`, `hooks/`). Uses `@medusajs/ui` + React 18.

- Other: `src/subscribers/` (event handlers), `src/jobs/` (scheduled jobs), `src/scripts/` (one-off scripts run via `medusa exec`, e.g. `seed.ts`, `create-approval-settings.ts`).

## Storefront Architecture

Next.js 15 **App Router** with heavy use of React Server Components and server actions. React 19.

- **Routing** (`src/app/[countryCode]/`): all routes are namespaced by country code (region), enforced by `src/middleware.ts`. Route groups: `(main)` (shop, account, cart, products, etc.) and `(checkout)`. The account section uses parallel routes (`@dashboard`, `@login`).

- **Data layer** (`src/lib/data/*.ts`): each file is a set of `"use server"` server actions wrapping the Medusa JS SDK (`sdk` from `src/lib/config.ts`). This is the single boundary for backend calls — components import from here rather than calling the SDK directly. Caching uses Next's `next: { tags }` options (see `getCacheOptions` in `cookies.ts`). Follow the existing pattern (graceful `.catch()` fallbacks, cache tags) when adding data functions.

- **UI modules** (`src/modules/<feature>/`): feature-oriented component groupings (cart, checkout, products, account, quotes, etc.), separate from `src/lib`. Styling via Tailwind + `@medusajs/ui`.

- **Client state**: React context in `src/lib/context/` (e.g. `cart-context.tsx`, `modal-context.tsx`) plus a `cart-event-bus.ts` for cross-component cart updates.

- Payments: Stripe and PayPal SDKs are wired in.

## Coding Rules

- **DRY (Don't Repeat Yourself)**: Do not duplicate logic, literals, or types. Extract shared behavior into reusable functions, and shared shapes into shared types. Before adding code, check whether an existing helper, service method, workflow, or data function already covers it and reuse it.
- **No magic values / hardcoded strings**: Never inline string or numeric literals that carry meaning (module keys, route paths, cache tags, event names, status values, config, etc.). Define them once as a named global constant, enum, or variable and reference that everywhere. Follow existing patterns — module keys live in each module's `index.ts` (`*_MODULE`), storefront config in `src/lib/config.ts` and `src/lib/constants.tsx`.

## Conventions & Gotchas

- **Don't hardcode store branding**: store name is fetched from the backend via the custom `GET /store/store-info` route (`backend/src/api/store/store-info/`) and `storefront/src/lib/data/store.ts`. Follow this pattern for other backend-driven config.
- Data model or link changes require a migration (`db:migrate`); module CRUD comes free from `MedusaService`.
- zod is pinned to `3.22.4` in both apps — keep validator schemas compatible.
- When upgrading and the Approval module was newly introduced, backfill existing companies with `npx medusa exec src/scripts/create-approval-settings.ts`.
