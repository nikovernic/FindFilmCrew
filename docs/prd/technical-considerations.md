# Technical Considerations

Technical Considerations
Stack Recommendations (for Architect)
Frontend:
Next.js (App Router) for SSR and SEO optimization
React for component architecture
TailwindCSS for styling
TypeScript for type safety
Backend:
Next.js API routes or NestJS (your existing stack)
PostgreSQL for relational data (crew, credits, users)
Supabase (familiar to you) or self-hosted Postgres
Search:
PostgreSQL full-text search (good for MVP)
Consider Algolia/Meilisearch for advanced search (post-MVP)
File Storage:
Supabase Storage or S3 for profile photos/media
Email:
Resend, SendGrid, or similar for transactional emails
SEO Infrastructure:
Next.js Metadata API
next-sitemap for automatic sitemap generation
Structured data (JSON-LD) for crew profiles
Key Technical Requirements
All crew profile pages must be SSR (not client-side rendered)
Clean URL structure with target keywords
Schema.org markup on all profile pages
Fast page loads - target <2s LCP
Mobile-first responsive design
Accessible (WCAG 2.1 AA compliance)
Secure (HTTPS, rate limiting on contact forms, SQL injection prevention)
Data Model (High-Level)
Users Table:
id, email, password_hash, role (admin/crew), created_at, updated_at
Profiles Table:
id, user_id (nullable for unclaimed), name, primary_role, primary_location_city, primary_location_state, bio, photo_url, contact_email, contact_phone, portfolio_url, union_status, years_experience, is_claimed, claim_token, created_at, updated_at
Credits Table:
id, profile_id, project_title, role, project_type, year, production_company, director, created_at
Contact_Inquiries Table (Optional for Analytics):
id, profile_id, producer_name, producer_email, message, shoot_dates, created_at