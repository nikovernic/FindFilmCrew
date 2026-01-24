Product Requirements Document (PRD)
Crew Up
Version: 1.0
 Date: December 12, 2024
 Status: Draft - MVP Scope
 Owner: Product/Founder

Executive Summary
Crew Up is a next-generation production crew database that connects producers with qualified crew members across the United States. By offering a superior user experience, powerful search capabilities, and industry-leading SEO, Crew Up will displace Production Hub as the go-to platform for crew discovery.
Business Model: Launch as free platform to rapidly build user base, introduce subscription pricing 2-3 months post-launch once critical mass is achieved.
Success Criteria: Become the #1 organic search result for queries like "[crew role] in [city/state]" (e.g., "AC in Nashville Tennessee").

Problem Statement
Current Market Reality
Production Hub is the incumbent solution but suffers from poor UX, outdated design, and limited functionality
Crew members pay $5/month for basic listing privileges on an inferior platform
Producers struggle to efficiently find qualified crew across different markets
Search discovery is fragmented - producers rely on Google searches that surface suboptimal results
No clear verification or profile claiming process exists in current solutions
Our Opportunity
Create a modern, clean, searchable crew database that:
Makes crew discovery effortless for producers
Provides crew members with professional profile pages to showcase their work
Dominates organic search results for crew-related queries
Offers seamless contact and communication flows

Target Users & Personas
Primary User: Producers
Who they are:
Commercial producers, documentary producers, corporate video producers, film/TV producers, indie creators, Production Managers, Production Coordinators
Shoot projects across the United States in various markets
Need crew quickly and efficiently for upcoming productions
Their Goals:
Find qualified crew in specific locations within minutes
View crew credits, reels, and work examples
Contact crew directly without friction
Filter by relevant criteria (role, location, experience level, union status)
Their Pain Points:
Current tools have poor search functionality
Results are often outdated or irrelevant
Difficult to assess crew quality quickly
Contact methods are unclear or broken
How They Find Us:
Google search: "[role] in [city]" (e.g., "gaffer in Atlanta Georgia")
AI assistants (ChatGPT, Claude, etc.)
Word of mouth from other producers

Secondary User: Crew Members
Who they are:
Camera operators, ACs, gaffers, grips, sound mixers, DITs, production coordinators, etc.
Freelancers working across multiple markets
Range from emerging talent to seasoned professionals
Their Goals:
Be discoverable by producers hiring in their market(s)
Showcase their credits, reels, and best work
Receive job inquiries directly
Control their profile information and availability status
Their Pain Points:
Current platforms charge fees for basic visibility
Profile customization is limited
Difficult to stand out from competitors
Unclear if their profile is actually being seen
How They Find Us:
Onboarded by admins (initially)
Claim verification email when profile is created on their behalf
Word of mouth from other crew
Producer recommendations

Admin User (Internal Team)
Who they are:
Founder and trusted team members with comprehensive crew database
Responsible for initial platform seeding and quality control
Their Goals:
Bulk import existing crew database efficiently
Maintain data quality and accuracy
Moderate flagged profiles or disputes
Monitor platform health and user activity

Core Features (MVP)
1. Crew Profile System
Profile Fields
Required:
Full Name
Primary Role/Title (e.g., "1st AC", "Gaffer", "Sound Mixer")
Primary Location (City, State)
Contact Method (Email and/or Phone)
Optional but Recommended:
Profile Photo
Bio/About (250 chars max for MVP)
Secondary Roles
Additional Markets/Locations
Years of Experience
Union Affiliation (IATSE, SAG-AFTRA, etc.)
Portfolio/Reel URL
Website
Social Links (Instagram, Vimeo, etc.)
Credits Section:
Project Title
Role on Project
Project Type (Commercial, Feature Film, Documentary, Music Video, etc.)
Year
Optional: Production Company, Director
Should be able to upload a CV or imdb to pull from
Optional for Later:
Day Rate Range (consider for post-paywall)
Availability Calendar
Equipment Owned
Certifications
Profile URLs
Clean, SEO-friendly URLs: /crew/[name]-[role]-[city]
Example: /crew/sarah-martinez-gaffer-nashville

2. Search & Discovery
Primary Search Interface
Search Input:
Free-text search with intelligent parsing
Example queries: "AC in Nashville", "gaffer Atlanta", "sound mixer Tennessee"
Filters (Progressive Disclosure):
Location (City, State, Region)
Role/Position
Union Status (Union, Non-Union, Either)
Experience Level (Entry, Mid, Senior)
Availability (Available Now, By Date Range - post-MVP)
Search Results Display:
Card-based layout
Shows: Name, Photo, Primary Role, Location, Top 3 Credits
Clear CTA: "View Profile" or "Contact"
Pagination (20 results per page initially)
SEO Optimization (Critical)
Technical Requirements:
Server-side rendering (SSR) for all crew profile pages
Semantic HTML with proper schema markup (Schema.org Person/Service)
Optimized meta tags per profile (title, description, OG tags)
Clean URL structure with target keywords
Fast page load times (<2s)
Mobile-responsive design
XML sitemap auto-generation
Robots.txt optimization
Content Strategy:
Individual profile pages are primary SEO targets
Each profile optimized for "[role] in [city]" queries
Location-based landing pages (e.g., "/crew/nashville-tennessee")
Role-based landing pages (e.g., "/crew/gaffers")

3. Contact Flow
For Producers (No Login Required for MVP):
Click "Contact" on crew profile
Simple form appears:
Producer Name
Email
Phone (optional)
Project Details (textarea, 500 chars max)
Shoot Dates (optional)
For Crew Members:
Click "Contact" on crew profile
Simple form appears:
Crew Name
Email
Phone 
Role, experience, etc. 
Optional Enhancement (Post-MVP):
In-platform messaging system
Inquiry tracking dashboard for crew

4. Profile Claiming System
Initial State:
Admin creates profile on behalf of crew member
Profile marked as "Unclaimed"
Verification token generated
Claim Flow:
Crew receives email: "Your profile has been created on Crew Up"
OR CREW CAN CLICK A CLAIM PROFILE BUTTON ON SITE
Email contains unique claim link with token
Crew clicks link → Verification page
Verification options:
Email verification (simplest for MVP)
Confirm name + primary email matches
Optional: Upload verification document if email doesn't match (e.g., crew resume/call sheet)
Set password
Profile now "Claimed" - crew has full editing access
Claim Invite Reminder System:
Reminder email sent after 7 days if unclaimed
Second reminder at 14 days
Profile remains live and searchable even if unclaimed
Get Listed System
Crew can click a get listed / sign up button that links to them creating an account with all the needed fields

5. Admin Dashboard
Core Admin Functions:
Add new crew profile (form-based)
Bulk import crew (CSV upload with mapping)
Edit any profile
Delete/Archive profiles
View claim status of all profiles
Send/Resend claim invitations
Search admin panel (find crew quickly for editing)
Quality Control:
Flag profiles for review
Merge duplicate profiles
Basic analytics dashboard:
Total profiles
Claimed vs. Unclaimed
Search queries (top 50)
Contact form submissions

6. Public Pages
Homepage:
Hero section with main search bar
Value proposition: "Find production crew across the US"
Featured crew or recent additions (6-8 profiles)
Location directory (major cities)
Role directory (major positions)
Location Pages:
/crew/[city]-[state]
Example: /crew/nashville-tennessee
Shows all crew in that location
Filterable by role
SEO-optimized for location-based searches
Role Pages:
/crew/[role-plural]
Example: /crew/gaffers
Shows all crew with that primary role
Filterable by location
SEO-optimized for role-based searches
About Page:
Platform story and mission
How it works (for producers and crew)
Contact information

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

User Flows
Flow 1: Producer Searches for Crew
Producer lands on homepage (via organic search or direct)
Enters search query: "gaffer in Atlanta"
Views search results (20 profiles)
Clicks on promising profile
Reviews profile: credits, reel, bio
Clicks "Contact"
Fills out contact form
Submits → Confirmation message shown
Email sent to crew member with inquiry
Flow 2: Admin Adds New Crew Member
Admin logs into dashboard
Clicks "Add Crew"
Fills out profile form (required + optional fields)
Saves profile
System generates claim token and sends invite email to crew
Profile goes live immediately (searchable)
Flow 3: Crew Claims Their Profile
Crew receives claim invitation email
Clicks claim link
Verification page loads with pre-filled info
Confirms information is correct
Sets password
Redirected to profile edit page
Adds additional information (reel, more credits, etc.)
Saves changes
Profile updated and live
Flow 4: Crew Edits Their Claimed Profile
Crew logs in
Navigates to "My Profile"
Clicks "Edit"
Updates fields (bio, credits, contact info, etc.)
Saves changes
Profile updated immediately
Flow 5: Crew Creates a New Profile
Crew clicks create profile / get listed
Inputs fields (bio, credits, contact info, etc.)
Saves changes
Profile updated immediately

Success Metrics
Phase 1: MVP Launch (Months 1-2)
Primary Metrics:
500+ crew profiles live
70% profile claim rate
Top 10 Google ranking for 50+ "[role] in [city]" queries
1,000+ unique producer searches per month
100+ contact form submissions per month
Secondary Metrics:
Average page load time <2s
Mobile traffic >50%
Bounce rate <40%
Phase 2: Growth (Months 3-4)
Primary Metrics:
1,500+ crew profiles live
85% profile claim rate
Top 3 Google ranking for 100+ "[role] in [city]" queries
5,000+ unique producer searches per month
500+ contact form submissions per month
Business Metrics:
Determine pricing model based on user feedback
Survey 50+ crew members on willingness to pay
Survey 25+ producers on premium feature needs

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

Out of Scope (MVP)
In-platform messaging system
Availability calendars
Payment processing for crew
Producer accounts/logins
Saved searches for producers
Job posting functionality
Rate transparency (day rates)
Equipment inventory listings
Multi-language support
Advanced filtering (specialty skills, equipment owned)

Future Considerations (Post-MVP)
Potential Features
Premium Crew Tiers - enhanced profiles, priority in search results
Producer Accounts - save searches, favorite crew, inquiry history
Job Board - producers post gigs, crew apply
Rate Transparency - crew can display day rate ranges
Availability Calendar - crew mark available/booked dates
Verification Badges - verified resumes, references, equipment
Equipment Listings - crew list owned gear
Crew Recommendations - "Crew who worked with Sarah also worked with..."
Market Insights - trending crew, popular roles by region
Mobile App - native iOS/Android apps
Monetization Strategy (Post-Launch)
Target: Month 3-4 Implementation
Crew Subscription Tiers:
Free: Basic profile, limited to 10 credits
Pro ($8-12/month): Unlimited credits, featured badge, enhanced profile customization, priority support
Premium ($15-20/month): All Pro features + priority in search results, analytics dashboard, unlimited portfolio media
Producer Features (Potential):
Free search and contact (always)
Premium account for saved searches, advanced filters, hiring history

Competitive Analysis
Production Hub (Primary Competitor)
Strengths:
Established brand (legacy advantage)
Existing user base
Known by industry
Weaknesses:
Poor UX/UI (outdated design)
Limited search functionality
Charges crew $5/month for basic listing
Weak SEO
Minimal profile customization
Our Advantage:
Modern, clean interface
Superior search and filtering
Free to start (lower barrier to entry)
SEO-first approach (organic discovery)
Easy profile claiming and management

Open Questions & Decisions Needed
Union vs. Non-Union Priority: Should union crew appear higher in search results by default?
Verification Requirements: How strict should profile verification be? Email-only vs. document upload?
Geographic Scope: Launch nationwide immediately or start with 5-10 major markets?
Pricing Timeline: Exactly when (Month 3? Month 4?) should we introduce paid tiers?
Featured Placements: Should admins be able to manually "feature" certain profiles on homepage?

Launch Checklist
Pre-Launch
[ ] Complete technical architecture review
[ ] Finalize database schema
[ ] Set up hosting infrastructure
[ ] Implement core features (search, profiles, claiming, contact)
[ ] Import initial 200-500 crew profiles from existing database
[ ] Send claim invitation emails to all imported crew
[ ] SEO audit (metadata, schema markup, sitemap, robots.txt)
[ ] Google Search Console setup
[ ] Performance testing (load times, mobile responsiveness)
[ ] Security audit (contact form validation, SQL injection prevention)
Launch Week
[ ] Soft launch to 50 trusted crew members for feedback
[ ] Iterate based on initial feedback
[ ] Public launch announcement
[ ] Submit sitemap to Google Search Console
[ ] Monitor search rankings daily for target keywords
[ ] Track contact form submissions and user feedback
Post-Launch (Month 1-2)
[ ] Achieve 70%+ profile claim rate
[ ] Reach top 10 for 50+ target keywords
[ ] Collect user feedback via surveys
[ ] Monitor and fix any bugs/issues
[ ] Begin planning monetization strategy

Success Criteria for MVP
The MVP is successful if:
✅ Producers can find qualified crew in <60 seconds
✅ Crew profiles rank in top 10 for target location + role searches
✅ Contact form completion rate >30%
✅ 70%+ crew claim their profiles within 30 days
✅ Zero critical bugs affecting search or contact functionality
✅ Page load times consistently <2s
✅ Platform generates organic traffic (not paid) from Google within 4 weeks

Document Version History:
v1.0 (Dec 12, 2024): Initial PRD for MVP scope
Approvals:
Product Owner: [Pending]
Technical Architect: [Pending]
Development Lead: [Pending]
