FROM node:21-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat

RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

FROM base AS builder
WORKDIR /app

# Copy all files (including the root package.json)
COPY . .

# Generate a partial monorepo with a pruned lockfile for backend
RUN turbo prune backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --no-frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN turbo run build --filter=backend

FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

WORKDIR /app
COPY --from=installer --chown=nodejs:nodejs /app .

# Install Prisma CLI for migrations using npm instead of pnpm
RUN npm install -g prisma

# Copy migration files and schema
COPY --from=installer --chown=nodejs:nodejs /app/packages/database/prisma ./prisma

USER nodejs
WORKDIR /app/apps/backend

ENV NODE_ENV=production

EXPOSE 4001

# Create startup script that runs migrations then starts the app
RUN echo '#!/bin/sh\necho "🔄 Running database migrations..."\nprisma migrate deploy --schema=../../prisma/schema.prisma\necho "✅ Migrations completed!"\necho "🚀 Starting application..."\nnode ./dist/main' > start.sh && chmod +x start.sh

CMD ["./start.sh"]
