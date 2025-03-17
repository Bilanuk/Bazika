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

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database ./packages/database
COPY apps/frontend ./apps/frontend

# Install dependencies and link workspace packages
RUN pnpm install --frozen-lockfile
RUN pnpm link --global

# Build the app
RUN pnpm turbo run build --filter=frontend

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache curl

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/frontend/next.config.mjs .
COPY --from=builder /app/apps/frontend/package.json .

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
CMD node apps/frontend/server.js
