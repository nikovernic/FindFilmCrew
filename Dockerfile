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

# NEXT_PUBLIC_ vars needed at build time (these are public/client-side keys)
ENV NEXT_PUBLIC_SUPABASE_URL=https://bjnfxzznblopuccuthpb.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbmZ4enpuYmxvcHVjY3V0aHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODg1OTksImV4cCI6MjA4NDg2NDU5OX0.qs0ifvccize0KlUTwV50OeOzWXg96iovuVK5go2eNaM

RUN pnpm --filter web build

# Production
FROM node:22-slim AS runner
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=https://bjnfxzznblopuccuthpb.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbmZ4enpuYmxvcHVjY3V0aHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODg1OTksImV4cCI6MjA4NDg2NDU5OX0.qs0ifvccize0KlUTwV50OeOzWXg96iovuVK5go2eNaM

COPY --from=base /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/web ./apps/web
COPY --from=base /app/packages/shared ./packages/shared

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
