FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm --filter web build

# Production
FROM node:22-slim AS runner
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/web ./apps/web
COPY --from=base /app/packages/shared ./packages/shared

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
