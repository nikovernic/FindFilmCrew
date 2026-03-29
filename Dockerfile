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

# NEXT_PUBLIC_ vars must be present at build time
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

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
