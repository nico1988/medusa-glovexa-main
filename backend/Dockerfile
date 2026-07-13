# syntax=docker/dockerfile:1

############################################
# Builder: install all deps + `medusa build`
############################################
FROM node:20-slim AS builder
WORKDIR /app

# pnpm via corepack (version pinned to match the repo)
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Install dependencies first for better layer caching. .npmrc must be present
# for this install: it sets node-linker=hoisted, which Medusa's admin build
# requires so the vite/rollup step can resolve transitive deps like
# @medusajs/dashboard from the top-level node_modules.
COPY package.json pnpm-lock.yaml .npmrc ./
# Keep the pnpm store and metadata cache outside the image layers. Without
# these mounts the runtime image can contain gigabytes of package cache and
# fail to unpack on a small deployment VM.
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    pnpm install --frozen-lockfile

# Build the app. `medusa build` compiles a self-contained server into
# .medusa/server (including the admin dashboard under public/admin).
COPY . .
RUN pnpm build

############################################
# Runner: only the compiled server + prod deps
############################################
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copy the compiled server produced by `medusa build`
COPY --from=builder /app/.medusa/server ./

# Keep the same hoisted node-linker for the production install so module
# resolution at runtime matches the build.
COPY .npmrc ./

# Install ONLY production dependencies for the compiled server. Cache mounts
# are build-only and are not exported into the final runtime image.
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    pnpm install --prod

# Entrypoint runs pending migrations, then starts the server
COPY --chmod=0755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "run", "start"]
