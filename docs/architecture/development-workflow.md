# Development Workflow


## Local Development Setup

### Prerequisites

```bash
# Required
- Node.js 18+ 
- pnpm 8+ (or npm/yarn)
- Supabase account (free tier works)
- Vercel account (for deployment)

# Optional but recommended
- VS Code with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript
```

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd crew-up

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Set up Supabase
# 1. Create new Supabase project
# 2. Run database migrations (schema.sql)
# 3. Configure storage bucket for profile photos
# 4. Set up Resend API key

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### Development Commands

```bash
# Start all services (frontend + API)
pnpm dev

# Start frontend only (if separated later)
pnpm dev:web

# Start backend only (if separated later)
pnpm dev:api

# Run tests
pnpm test              # All tests
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests only
pnpm test:e2e           # E2E tests only

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Build for production
pnpm build

# Start production server locally
pnpm start
```

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=/api  # For local dev, use /api

# Backend (same file, server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxxxxxxx
NODE_ENV=development

# Shared
DATABASE_URL=postgresql://...  # Supabase connection string
```

