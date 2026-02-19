FROM node:20-alpine AS builder

# Install pnpm per corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Build the API (and its dependencies via turbo)
RUN pnpm turbo run build --filter=api...

FROM node:20-alpine AS runner
WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install pnpm in runner as well (useful for migrations or scripts)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy necessary files from builder
# We copy the entire app directory to preserve symlinks and structure for pnpm
# This is heavy but reliably works for monorepos without complex pruning
COPY --from=builder --chown=nestjs:nodejs /app ./

# Switch to the api directory
WORKDIR /app/apps/api

# Expose the API port
EXPOSE 3001

# Set the command to start the API
CMD ["node", "dist/main"]
