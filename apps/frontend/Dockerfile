FROM node:21-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_STORE_PATH="/pnpm/store"

RUN corepack enable
RUN corepack prepare pnpm@9.6.0 --activate
RUN pnpm config set store-dir $PNPM_STORE_PATH --global
RUN pnpm install turbo --global

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy all files (including the root package.json)
COPY . .

# Generate a partial monorepo with a pruned lockfile for frontend
RUN turbo prune frontend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=frontend

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache curl

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/frontend/next.config.mjs .
COPY --from=installer /app/apps/frontend/package.json .

COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
CMD node apps/frontend/server.js
