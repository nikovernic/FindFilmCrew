# Components


## Frontend Components

### SearchInterface
**Responsibility:** Primary search interface for producers to find crew. Handles search input, filters, and results display.

**Key Interfaces:**
- `handleSearch(query: string, filters: SearchFilters): Promise<SearchResults>`
- `handleFilterChange(filter: string, value: any): void`

**Dependencies:** API routes (`/api/profiles`), SearchService

**Technology Stack:** Next.js Server Component with Client Component for interactivity, React Hook Form for filters

### ProfileCard
**Responsibility:** Displays crew profile summary in search results. Shows name, photo, role, location, and top credits.

**Key Interfaces:**
- Props: `profile: Profile`, `onContact: () => void`

**Dependencies:** None (presentational component)

**Technology Stack:** React Server Component, Tailwind CSS

### ProfilePage
**Responsibility:** Full crew profile page with all details, credits, and contact form. Server-rendered for SEO.

**Key Interfaces:**
- Server Component that fetches profile data
- Client Component for contact form submission

**Dependencies:** API routes (`/api/profiles/[slug]`), ContactService

**Technology Stack:** Next.js Server Component, React Server Components, shadcn/ui components

### ContactForm
**Responsibility:** Contact form for producers to reach out to crew members. Includes validation and rate limiting.

**Key Interfaces:**
- `onSubmit(data: ContactFormData): Promise<void>`

**Dependencies:** API routes (`/api/profiles/[id]/contact`), Resend email service

**Technology Stack:** React Hook Form, Zod validation, shadcn/ui form components

### AdminDashboard
**Responsibility:** Admin interface for managing profiles, bulk imports, and viewing analytics.

**Key Interfaces:**
- `createProfile(data: CreateProfileData): Promise<Profile>`
- `bulkImport(file: File): Promise<ImportResult>`
- `getAnalytics(): Promise<Analytics>`

**Dependencies:** API routes (`/api/admin/*`), Supabase client

**Technology Stack:** Next.js App Router, React Server Components, shadcn/ui data tables

## Backend Components

### ProfileService
**Responsibility:** Business logic for profile operations - search, retrieval, creation, updates.

**Key Interfaces:**
- `searchProfiles(query: SearchQuery): Promise<Profile[]>`
- `getProfileBySlug(slug: string): Promise<Profile | null>`
- `createProfile(data: CreateProfileData): Promise<Profile>`
- `updateProfile(id: string, data: UpdateProfileData): Promise<Profile>`

**Dependencies:** Database repository, SlugService

**Technology Stack:** TypeScript service layer, Supabase client

### SearchService
**Responsibility:** Handles search query parsing and database queries. Implements full-text search and filtering.

**Key Interfaces:**
- `parseSearchQuery(query: string): ParsedQuery`
- `buildSearchQuery(parsed: ParsedQuery, filters: Filters): SQLQuery`
- `executeSearch(query: SQLQuery): Promise<Profile[]>`

**Dependencies:** Database repository, PostgreSQL full-text search

**Technology Stack:** PostgreSQL full-text search, query builder

### ClaimService
**Responsibility:** Manages profile claiming flow - token generation, validation, and profile ownership transfer.

**Key Interfaces:**
- `generateClaimToken(profileId: string): Promise<string>`
- `validateClaimToken(token: string): Promise<Profile | null>`
- `claimProfile(token: string, userData: ClaimData): Promise<void>`
- `sendClaimEmail(profile: Profile, token: string): Promise<void>`

**Dependencies:** Database repository, EmailService, Supabase Auth

**Technology Stack:** TypeScript service, Resend API, Supabase Auth

### EmailService
**Responsibility:** Sends transactional emails - claim invitations, contact form notifications, reminders.

**Key Interfaces:**
- `sendClaimInvitation(profile: Profile, token: string): Promise<void>`
- `sendContactNotification(profile: Profile, inquiry: ContactInquiry): Promise<void>`
- `sendClaimReminder(profile: Profile, token: string): Promise<void>`

**Dependencies:** Resend API

**Technology Stack:** Resend SDK, React Email templates

### SEOService
**Responsibility:** Generates SEO metadata, schema markup, and sitemaps for all profile pages.

**Key Interfaces:**
- `generateMetadata(profile: Profile): Metadata`
- `generateSchemaMarkup(profile: Profile): JSON-LD`
- `generateSitemap(): Promise<Sitemap>`

**Dependencies:** ProfileService

**Technology Stack:** Next.js Metadata API, JSON-LD generation

## Component Diagrams

```mermaid
graph TB
    subgraph "Frontend Layer"
        SearchUI[SearchInterface]
        ProfilePage[ProfilePage]
        ContactForm[ContactForm]
        AdminUI[AdminDashboard]
    end
    
    subgraph "API Layer"
        ProfileAPI[/api/profiles]
        ContactAPI[/api/profiles/:id/contact]
        AdminAPI[/api/admin/*]
        ClaimAPI[/api/auth/claim]
    end
    
    subgraph "Service Layer"
        ProfileSvc[ProfileService]
        SearchSvc[SearchService]
        ClaimSvc[ClaimService]
        EmailSvc[EmailService]
        SEOSvc[SEOService]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Storage[(Supabase Storage)]
        Auth[Supabase Auth]
    end
    
    subgraph "External Services"
        Resend[Resend Email]
        Google[Google Search]
    end
    
    SearchUI --> ProfileAPI
    ProfilePage --> ProfileAPI
    ProfilePage --> ContactAPI
    ContactForm --> ContactAPI
    AdminUI --> AdminAPI
    
    ProfileAPI --> ProfileSvc
    ProfileAPI --> SearchSvc
    ContactAPI --> EmailSvc
    AdminAPI --> ProfileSvc
    ClaimAPI --> ClaimSvc
    
    ProfileSvc --> DB
    SearchSvc --> DB
    ClaimSvc --> DB
    ClaimSvc --> Auth
    EmailSvc --> Resend
    SEOSvc --> ProfileSvc
    
    ProfileSvc --> Storage
    ProfilePage --> SEOSvc
    SEOSvc --> Google
    
    style ProfileSvc fill:#3ecf8e
    style DB fill:#336791
    style SearchSvc fill:#3ecf8e
```

