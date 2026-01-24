# Coding Standards


## Critical Fullstack Rules

- **Type Sharing:** Always define types in `packages/shared/src/types` and import from there. Never duplicate type definitions.
- **API Calls:** Never make direct HTTP calls in components. Always use the service layer (`lib/services/*`).
- **Environment Variables:** Access only through config objects (`lib/config`), never `process.env` directly in components.
- **Error Handling:** All API routes must use the standard error handler. Return consistent error format.
- **State Updates:** Never mutate state directly. Use proper state management patterns (Server Components for data, Zustand for UI state).
- **SEO Requirements:** All crew profile pages must be Server Components with proper metadata. No client-side rendering for profile content.
- **Database Queries:** Always use Supabase client, never raw SQL. Use Row Level Security policies.
- **File Uploads:** Profile photos must be uploaded to Supabase Storage, never stored in database as base64.

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ProfileCard.tsx` |
| Hooks | camelCase with 'use' | - | `useSearch.ts` |
| API Routes | - | kebab-case | `/api/profiles/[slug]` |
| Database Tables | - | snake_case | `user_profiles` |
| Services | camelCase | camelCase | `profileService.ts` |
| Types/Interfaces | PascalCase | PascalCase | `Profile`, `SearchFilters` |

