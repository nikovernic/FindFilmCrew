# Tech Stack


## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe frontend code | Prevents bugs, improves DX, enables shared types |
| Frontend Framework | Next.js | 14+ (App Router) | React framework with SSR | Critical for SEO, built-in optimizations, API routes |
| UI Component Library | shadcn/ui | Latest | Accessible component primitives | Customizable, accessible, Tailwind-based |
| State Management | React Server Components + Zustand | Latest | Server components + client state | Server components reduce client JS, Zustand for client state |
| Backend Language | TypeScript | 5.3+ | Type-safe backend code | Shared types with frontend, type safety |
| Backend Framework | Next.js API Routes | 14+ | Serverless API endpoints | Integrated with frontend, simple deployment |
| API Style | REST | - | RESTful API design | Simple, standard, easy to understand |
| Database | PostgreSQL | 15+ | Relational database | Via Supabase, excellent for structured crew data |
| Cache | Vercel Edge Cache + React Cache | - | Edge caching + React cache | Built-in Next.js caching, edge performance |
| File Storage | Supabase Storage | - | Profile photos and media | Integrated with Supabase, simple API |
| Authentication | Supabase Auth | - | User authentication | Built-in, secure, handles sessions |
| Frontend Testing | Vitest + React Testing Library | Latest | Unit and component tests | Fast, modern, great DX |
| Backend Testing | Vitest + Supertest | Latest | API route testing | Same test runner, consistent tooling |
| E2E Testing | Playwright | Latest | End-to-end testing | Reliable, fast, great for critical flows |
| Build Tool | Next.js (Turbopack) | 14+ | Build and bundling | Built-in, fast, optimized |
| Bundler | Turbopack | - | Fast bundling | Next.js default, significantly faster than Webpack |
| IaC Tool | Vercel CLI | - | Infrastructure as code | Platform-native, simple deployments |
| CI/CD | GitHub Actions | - | Continuous integration | Free for public repos, well-integrated |
| Monitoring | Vercel Analytics + Sentry | - | Performance and error tracking | Built-in analytics, Sentry for errors |
| Logging | Vercel Logs + Supabase Logs | - | Application logging | Platform-native logging |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first CSS | Fast development, consistent design |

