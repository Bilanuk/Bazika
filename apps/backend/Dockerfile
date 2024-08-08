# Base image with necessary tools installed
FROM node:21-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && pnpm install turbo --global && apk add --no-cache libc6-compat

# Builder stage
FROM base AS builder
WORKDIR /app
COPY . .

# Prune and prepare the project for production
RUN pnpm install turbo --global && turbo prune --scope=backend --docker

# Installer stage to handle dependencies and build
FROM base AS installer
WORKDIR /app

# Add necessary files for installation
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install

# Build the backend application
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN turbo run build --filter=backend

# Runner stage
FROM node:21-alpine AS runner
WORKDIR /app

# Install corepack and pnpm in the runner image
RUN corepack enable && corepack prepare pnpm@latest --activate && apk add --no-cache curl

# Copy the built application files and install production dependencies
COPY --from=installer /app/apps/backend/dist ./dist
COPY --from=installer /app/apps/backend/package.json ./package.json
COPY --from=installer /app/apps/backend/tsconfig.build.json ./tsconfig.build.json
COPY --from=installer /app/apps/backend/prisma ./prisma

RUN pnpm install --prod && pnpx prisma generate

EXPOSE 4001

CMD ["node", "./dist/main"]
