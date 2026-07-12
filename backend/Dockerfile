# syntax=docker/dockerfile:1

############################################
# Builder: install all deps + `medusa build`
############################################
FROM node:20-slim AS builder
WORKDIR /app

# pnpm via corepack (version pinned to match the repo)
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Install dependencies first for better layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

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

# Install ONLY production dependencies for the compiled server
RUN pnpm install --prod

# Entrypoint runs pending migrations, then starts the server
COPY --chmod=0755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "run", "start"]
