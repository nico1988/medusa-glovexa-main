#!/bin/sh
set -e

# Apply database migrations on boot. Safe for a single-instance deployment.
# If you scale the backend to multiple instances, run migrations as a
# separate one-off step instead and set RUN_MIGRATIONS=false here.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "▶ Applying database migrations..."
  pnpm exec medusa db:migrate
fi

exec "$@"
