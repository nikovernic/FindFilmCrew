# Data Models


## User

**Purpose:** Represents authenticated users (crew members and admins) in the system. Handles authentication and authorization.

**Key Attributes:**
- `id`: UUID - Primary key, Supabase-generated
- `email`: string - Unique email address for login
- `password_hash`: string - Hashed password (handled by Supabase Auth)
- `role`: enum('admin', 'crew') - User role determining permissions
- `created_at`: timestamp - Account creation time
- `updated_at`: timestamp - Last update time

**TypeScript Interface:**
```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'crew';
  created_at: string;
  updated_at: string;
}
```

**Relationships:**
- One-to-one with Profile (crew members only)
- Managed by Supabase Auth (extended with custom role field)

## Profile

**Purpose:** Core entity representing a crew member's public profile. Contains all information displayed on profile pages and used in search.

**Key Attributes:**
- `id`: UUID - Primary key
- `user_id`: UUID (nullable) - Foreign key to User, null if unclaimed
- `name`: string - Full name of crew member
- `primary_role`: string - Main role/title (e.g., "1st AC", "Gaffer")
- `primary_location_city`: string - Primary city
- `primary_location_state`: string - Primary state (2-letter code)
- `bio`: string (nullable, max 250 chars) - Short bio/about section
- `photo_url`: string (nullable) - URL to profile photo in Supabase Storage
- `contact_email`: string - Email for contact form submissions
- `contact_phone`: string (nullable) - Phone number
- `portfolio_url`: string (nullable) - Link to reel/portfolio
- `website`: string (nullable) - Personal website
- `instagram_url`: string (nullable) - Instagram profile
- `vimeo_url`: string (nullable) - Vimeo profile
- `union_status`: enum('union', 'non-union', 'either') (nullable) - Union affiliation
- `years_experience`: integer (nullable) - Years of experience
- `secondary_roles`: string[] (nullable) - Array of additional roles
- `additional_markets`: jsonb (nullable) - Array of {city, state} objects for other markets
- `is_claimed`: boolean - Whether profile has been claimed by crew member
- `claim_token`: string (nullable) - Unique token for profile claiming
- `claim_token_expires_at`: timestamp (nullable) - Token expiration
- `slug`: string - URL-friendly identifier (e.g., "sarah-martinez-gaffer-nashville")
- `created_at`: timestamp - Profile creation time
- `updated_at`: timestamp - Last update time

**TypeScript Interface:**
```typescript
interface Profile {
  id: string;
  user_id: string | null;
  name: string;
  primary_role: string;
  primary_location_city: string;
  primary_location_state: string;
  bio: string | null;
  photo_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  portfolio_url: string | null;
  website: string | null;
  instagram_url: string | null;
  vimeo_url: string | null;
  union_status: 'union' | 'non-union' | 'either' | null;
  years_experience: number | null;
  secondary_roles: string[] | null;
  additional_markets: Array<{city: string; state: string}> | null;
  is_claimed: boolean;
  claim_token: string | null;
  claim_token_expires_at: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}
```

**Relationships:**
- One-to-many with Credit (a profile has many credits)
- One-to-one with User (if claimed)
- Many-to-many with ContactInquiry (through contact form submissions)

## Credit

**Purpose:** Represents a crew member's work credits/projects. Displayed on profile pages to showcase experience.

**Key Attributes:**
- `id`: UUID - Primary key
- `profile_id`: UUID - Foreign key to Profile
- `project_title`: string - Name of the project
- `role`: string - Role on this specific project
- `project_type`: enum('commercial', 'feature_film', 'documentary', 'music_video', 'tv', 'corporate', 'other') - Type of project
- `year`: integer - Year project was completed
- `production_company`: string (nullable) - Production company name
- `director`: string (nullable) - Director name
- `display_order`: integer - Order for display on profile (lower = higher priority)
- `created_at`: timestamp - Credit creation time
- `updated_at`: timestamp - Last update time

**TypeScript Interface:**
```typescript
interface Credit {
  id: string;
  profile_id: string;
  project_title: string;
  role: string;
  project_type: 'commercial' | 'feature_film' | 'documentary' | 'music_video' | 'tv' | 'corporate' | 'other';
  year: number;
  production_company: string | null;
  director: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}
```

**Relationships:**
- Many-to-one with Profile (many credits belong to one profile)

## ContactInquiry

**Purpose:** Stores contact form submissions from producers to crew members. Used for analytics and potential future inquiry tracking.

**Key Attributes:**
- `id`: UUID - Primary key
- `profile_id`: UUID - Foreign key to Profile (crew member being contacted)
- `producer_name`: string - Name of producer submitting inquiry
- `producer_email`: string - Email of producer
- `producer_phone`: string (nullable) - Phone number
- `message`: string (max 500 chars) - Project details message
- `shoot_dates`: string (nullable) - Shoot date information
- `created_at`: timestamp - Inquiry submission time

**TypeScript Interface:**
```typescript
interface ContactInquiry {
  id: string;
  profile_id: string;
  producer_name: string;
  producer_email: string;
  producer_phone: string | null;
  message: string;
  shoot_dates: string | null;
  created_at: string;
}
```

**Relationships:**
- Many-to-one with Profile (many inquiries to one profile)

