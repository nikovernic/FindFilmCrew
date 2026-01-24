# Testing Strategy


## Testing Pyramid

```
        E2E Tests (Playwright)
       /                    \
   Integration Tests (Vitest)
   /                          \
Frontend Unit (RTL)    Backend Unit (Vitest)
```

## Test Organization

**Frontend Tests:**
```
apps/web/tests/
├── unit/
│   ├── components/
│   └── hooks/
├── integration/
│   └── services/
└── __mocks__/
```

**Backend Tests:**
```
apps/web/tests/
├── unit/
│   └── services/
├── integration/
│   └── api/
└── __fixtures__/
```

**E2E Tests:**
```
tests/e2e/
├── search.spec.ts
├── profile.spec.ts
├── contact.spec.ts
└── admin.spec.ts
```

## Test Examples

**Frontend Component Test:**
```typescript
// tests/unit/components/ProfileCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { Profile } from '@/types';

describe('ProfileCard', () => {
  it('displays profile information', () => {
    const profile: Profile = {
      id: '1',
      name: 'John Doe',
      primary_role: 'Gaffer',
      primary_location_city: 'Nashville',
      primary_location_state: 'TN',
      slug: 'john-doe-gaffer-nashville',
      // ... other fields
    };
    
    render(<ProfileCard profile={profile} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Gaffer')).toBeInTheDocument();
    expect(screen.getByText('Nashville, TN')).toBeInTheDocument();
  });
});
```

**Backend API Test:**
```typescript
// tests/integration/api/profiles.test.ts
import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/profiles/route';

describe('/api/profiles', () => {
  it('returns profiles for valid search', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/profiles?q=gaffer&city=Nashville',
    });
    
    await GET(req as any);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.profiles).toBeInstanceOf(Array);
  });
});
```

**E2E Test:**
```typescript
// tests/e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('producer can search for crew', async ({ page }) => {
  await page.goto('/');
  
  await page.fill('input[placeholder*="search"]', 'gaffer in Nashville');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=Gaffer')).toBeVisible();
  await expect(page.locator('text=Nashville')).toBeVisible();
});
```

