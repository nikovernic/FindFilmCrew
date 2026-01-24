# Epic Organization

Epic Organization
The MVP features are organized into 7 development epics that build upon each other sequentially. Each epic delivers a complete, deployable increment of functionality.

Epic 1: Foundation & Infrastructure
Goal: Establish project foundation, database schema, authentication infrastructure, and basic public pages to enable all subsequent development.
Dependencies: None (foundational)
Deliverables:
- Project initialization (monorepo setup, dependencies)
- Database schema implementation (Users, Profiles, Credits, ContactInquiries tables)
- Authentication infrastructure (Supabase Auth integration)
- Basic public pages (Homepage with search placeholder, About page)
- CI/CD pipeline setup
- Development environment configuration

Epic 2: Core Profile System
Goal: Enable creation, storage, and basic display of crew profiles. This establishes the core data model that all other features depend on.
Dependencies: Epic 1 (database and infrastructure)
Deliverables:
- Profile data model implementation
- Profile creation API (admin-only initially)
- Basic profile display pages (server-side rendered)
- Profile photo upload functionality
- Credits management (add, edit, delete credits)
- Slug generation for SEO-friendly URLs

Epic 3: Public Profile Pages & SEO Foundation
Goal: Create fully SEO-optimized individual profile pages that will rank in search results. This is critical for the platform's organic discovery strategy.
Dependencies: Epic 2 (profiles must exist)
Deliverables:
- Individual profile pages with SSR (/crew/[slug])
- SEO metadata generation (title, description, OG tags)
- Schema.org markup (Person/Service)
- XML sitemap generation
- Robots.txt configuration
- Image optimization for profile photos
- Performance optimization (<2s load time target)

Epic 4: Search & Discovery
Goal: Enable producers to find crew members through search and filtering. This is the primary user journey for the platform.
Dependencies: Epic 2 (profiles), Epic 3 (profile pages for navigation)
Deliverables:
- Full-text search implementation (PostgreSQL)
- Search query parsing (extract role, location from natural language)
- Search filters (location, role, union status, experience level)
- Search results page with pagination
- Profile cards component
- Search results SEO optimization

Epic 5: Contact Flow
Goal: Enable producers to contact crew members directly. This completes the primary producer journey.
Dependencies: Epic 3 (profile pages where contact form appears), Epic 4 (search to find profiles)
Deliverables:
- Contact form component
- Contact form API endpoint
- Email notification system (Resend integration)
- Rate limiting on contact forms
- Contact inquiry storage (for analytics)
- Form validation and error handling

Epic 6: Profile Claiming System
Goal: Enable crew members to claim and manage their own profiles. This empowers crew to keep their information current.
Dependencies: Epic 2 (profiles), Epic 5 (email system for claim invitations)
Deliverables:
- Profile claiming token generation
- Claim invitation email system
- Claim verification page
- Profile claiming API (email verification)
- Crew authentication (Supabase Auth for crew accounts)
- Profile edit interface for claimed profiles
- Claim reminder email system (7-day and 14-day reminders)
- "Get Listed" flow for new crew signups

Epic 7: Admin Dashboard
Goal: Provide admin interface for managing profiles, monitoring platform health, and seeding initial data.
Dependencies: Epic 2 (profiles), Epic 6 (claiming system for status tracking)
Deliverables:
- Admin authentication and authorization
- Admin dashboard UI
- Profile management (create, edit, delete)
- Bulk import functionality (CSV upload)
- Claim status tracking
- Claim invitation management (send/resend)
- Basic analytics dashboard
- Admin search functionality

Epic Dependencies Diagram:
```
Epic 1 (Foundation)
    ↓
Epic 2 (Core Profiles)
    ↓
Epic 3 (Profile Pages & SEO) ← Epic 4 (Search) ← Epic 5 (Contact)
    ↓
Epic 6 (Profile Claiming)
    ↓
Epic 7 (Admin Dashboard)
```

Note: Epics 3, 4, and 5 can be developed in parallel after Epic 2, but Epic 5 requires Epic 3 to be complete. Epic 6 can begin after Epic 2 and Epic 5 (for email infrastructure). Epic 7 can be developed in parallel with other epics but requires Epic 2 and benefits from Epic 6 completion.