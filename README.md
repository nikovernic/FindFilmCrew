# Crew Up

Production crew database platform connecting producers with qualified crew members across the United States.

## Project Overview

Crew Up is a next-generation production crew database that offers superior user experience, powerful search capabilities, and industry-leading SEO to help producers find qualified crew members efficiently.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), React, TypeScript 5.3+, Tailwind CSS 3.4+
- **Backend:** Next.js API Routes, TypeScript 5.3+
- **Database:** PostgreSQL 15+ (via Supabase)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Testing:** Vitest, React Testing Library, Playwright
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel

## Project Structure

This is a monorepo using npm workspaces:

```
crew-up/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   └── shared/           # Shared TypeScript types and utilities
└── docs/                  # Documentation
```

## Prerequisites

- Node.js 18+
- pnpm 8+ (or npm/yarn)
- Supabase account (free tier works)
- Vercel account (for deployment)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=development
```

### 3. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the database migrations (see `docs/architecture/database-schema.md`)
3. Configure storage bucket for profile photos
4. Set up Resend API key (for future email functionality)

### 4. Run Database Migrations

Database schema is defined in the architecture documentation. Apply it via Supabase SQL Editor or CLI.

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests only
- `pnpm test:integration` - Run integration tests only
- `pnpm test:e2e` - Run end-to-end tests

## Development Workflow

1. Create a feature branch from `main`
2. Implement changes following the architecture and coding standards
3. Write tests for new functionality
4. Ensure all tests pass and linting is clean
5. Submit a pull request

## Documentation

- [Product Requirements Document](./docs/prd/)
- [Architecture Documentation](./docs/architecture/)
- [Stories](./docs/stories/)

## License

Private - All rights reserved

