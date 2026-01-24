# Frontend Architecture


## Component Architecture

### Component Organization

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx             # Homepage
│   │   ├── crew/                # Crew-related pages
│   │   │   ├── [slug]/          # Individual profile pages
│   │   │   │   └── page.tsx
│   │   │   ├── [city]-[state]/  # Location pages
│   │   │   │   └── page.tsx
│   │   │   └── [role]/          # Role pages
│   │   │       └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   ├── (auth)/                  # Auth-protected routes
│   │   ├── dashboard/           # Crew dashboard
│   │   │   └── page.tsx
│   │   └── admin/               # Admin dashboard
│   │       └── page.tsx
│   ├── api/                     # API routes
│   │   ├── profiles/
│   │   ├── auth/
│   │   └── admin/
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── ui/                      # shadcn/ui components
│   ├── search/                  # Search-related components
│   │   ├── SearchInterface.tsx
│   │   ├── SearchFilters.tsx
│   │   └── SearchResults.tsx
│   ├── profile/                 # Profile-related components
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── CreditsList.tsx
│   │   └── ContactForm.tsx
│   └── admin/                   # Admin components
│       ├── ProfileForm.tsx
│       ├── BulkImport.tsx
│       └── Analytics.tsx
├── lib/                         # Utilities and services
│   ├── supabase/               # Supabase client
│   ├── services/               # API service layer
│   │   ├── profileService.ts
│   │   ├── searchService.ts
│   │   └── contactService.ts
│   └── utils/                  # Helper functions
├── types/                       # TypeScript types
│   └── index.ts
└── hooks/                       # Custom React hooks
    ├── useSearch.ts
    └── useProfile.ts
```

### Component Template

```typescript
// Example: ProfileCard.tsx
import { Profile } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Link href={`/crew/${profile.slug}`}>
      <article className="rounded-lg border p-4 hover:shadow-lg transition-shadow">
        <div className="flex gap-4">
          {profile.photo_url && (
            <Image
              src={profile.photo_url}
              alt={profile.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-muted-foreground">{profile.primary_role}</p>
            <p className="text-sm">
              {profile.primary_location_city}, {profile.primary_location_state}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
```

## State Management Architecture

### State Structure

```typescript
// Using React Server Components + Zustand for client state
// Server Components handle data fetching
// Zustand stores client-side UI state

// stores/searchStore.ts
import { create } from 'zustand';

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Profile[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setResults: (results: Profile[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  filters: {},
  results: [],
  isLoading: false,
  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  setResults: (results) => set({ results }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
```

### State Management Patterns

- **Server Components for Data:** All initial data fetching happens in Server Components
- **Client Components for Interactivity:** Forms, search inputs, and interactive UI use Client Components
- **Zustand for Client State:** Only for UI state that needs to persist across navigation (search filters, etc.)
- **URL State for Search:** Search queries and filters stored in URL params for shareability and SEO
- **React Cache for Data:** Use React's `cache()` for request deduplication in Server Components

## Routing Architecture

### Route Organization

```
/                           # Homepage with search
/crew/[slug]               # Individual profile pages (SSR for SEO)
/crew/[city]-[state]       # Location-based listings
/crew/[role]               # Role-based listings
/about                     # About page
/dashboard                 # Crew member dashboard (protected)
/admin                     # Admin dashboard (protected)
/api/*                     # API routes
```

### Protected Route Pattern

```typescript
// app/(auth)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return <DashboardContent profile={profile} />;
}
```

## Frontend Services Layer

### API Client Setup

```typescript
// lib/services/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || 'An error occurred',
      response.status,
      error
    );
  }
  
  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
```

### Service Example

```typescript
// lib/services/profileService.ts
import { apiClient } from './apiClient';
import { Profile, SearchFilters, SearchResults } from '@/types';

export const profileService = {
  async search(query: string, filters: SearchFilters): Promise<SearchResults> {
    const params = new URLSearchParams({
      q: query,
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>),
    });
    
    return apiClient.get<SearchResults>(`/profiles?${params}`);
  },
  
  async getBySlug(slug: string): Promise<Profile> {
    return apiClient.get<Profile>(`/profiles/${slug}`);
  },
  
  async contact(profileId: string, data: ContactFormData): Promise<void> {
    return apiClient.post(`/profiles/${profileId}/contact`, data);
  },
};
```

