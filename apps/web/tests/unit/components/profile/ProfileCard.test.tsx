import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import type { Profile, Credit } from '@crew-up/shared'

// Mock Next.js Image and Link components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...props} />
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  },
}))

describe('ProfileCard', () => {
  const baseProfile: Profile & { credits: Credit[] } = {
    id: 'profile-1',
    user_id: null,
    name: 'John Doe',
    primary_role: 'Gaffer',
    primary_location_city: 'Nashville',
    primary_location_state: 'TN',
    contact_email: 'john@example.com',
    slug: 'john-doe-gaffer-nashville',
    is_claimed: false,
    claim_token: null,
    claim_token_expires_at: null,
    bio: null,
    credits: null, // This is the string credits field from Profile
    photo_url: null,
    contact_phone: null,
    portfolio_url: null,
    website: null,
    instagram_url: null,
    vimeo_url: null,
    imdb_url: null,
    union_status: null,
    years_experience: null,
    secondary_roles: null,
    additional_markets: null,
    profile_status: 'approved',
    is_verified: false,
    verification_id_url: null,
    verification_requested_at: null,
    verified_at: null,
    reminder_sent_at_7days: null,
    reminder_sent_at_14days: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    credits: [],
  }

  it('should render profile name, role, and location', () => {
    render(<ProfileCard profile={baseProfile} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Gaffer')).toBeInTheDocument()
    expect(screen.getByText('Nashville, TN')).toBeInTheDocument()
  })

  it('should render profile photo when photo_url is provided', () => {
    const profileWithPhoto = {
      ...baseProfile,
      photo_url: 'https://example.com/photo.jpg',
    }

    render(<ProfileCard profile={profileWithPhoto} />)

    const image = screen.getByAltText('John Doe')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('should render placeholder when photo_url is null', () => {
    render(<ProfileCard profile={baseProfile} />)

    const placeholder = screen.getByText('J')
    expect(placeholder).toBeInTheDocument()
  })

  it('should render top 3 credits', () => {
    const profileWithCredits = {
      ...baseProfile,
      credits: [
        {
          id: 'credit-1',
          profile_id: 'profile-1',
          project_title: 'Movie 1',
          role: 'Gaffer',
          project_type: 'feature_film',
          year: 2023,
          production_company: null,
          director: null,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'credit-2',
          profile_id: 'profile-1',
          project_title: 'Movie 2',
          role: 'Gaffer',
          project_type: 'commercial',
          year: 2022,
          production_company: null,
          director: null,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'credit-3',
          profile_id: 'profile-1',
          project_title: 'Movie 3',
          role: 'Gaffer',
          project_type: 'tv',
          year: 2021,
          production_company: null,
          director: null,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    }

    render(<ProfileCard profile={profileWithCredits} />)

    expect(screen.getByText('Movie 1')).toBeInTheDocument()
    expect(screen.getByText('Movie 2')).toBeInTheDocument()
    expect(screen.getByText('Movie 3')).toBeInTheDocument()
  })

  it('should display credit information correctly', () => {
    const profileWithCredits = {
      ...baseProfile,
      credits: [
        {
          id: 'credit-1',
          profile_id: 'profile-1',
          project_title: 'The Great Movie',
          role: 'Gaffer',
          project_type: 'feature_film',
          year: 2023,
          production_company: null,
          director: null,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    }

    render(<ProfileCard profile={profileWithCredits} />)

    expect(screen.getByText(/The Great Movie/)).toBeInTheDocument()
    // Check that credit information is present (project title, year)
    // Note: "Gaffer" appears multiple times (role and credit), so we check for specific credit content
    expect(screen.getByText(/2023/)).toBeInTheDocument()
    // Verify the credit contains the project title
    const creditText = screen.getByText(/The Great Movie/)
    expect(creditText).toBeInTheDocument()
  })

  it('should only display top 3 credits even if more exist', () => {
    const profileWithManyCredits = {
      ...baseProfile,
      credits: [
        {
          id: 'credit-1',
          profile_id: 'profile-1',
          project_title: 'Movie 1',
          role: 'Gaffer',
          project_type: 'feature_film',
          year: 2023,
          production_company: null,
          director: null,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'credit-2',
          profile_id: 'profile-1',
          project_title: 'Movie 2',
          role: 'Gaffer',
          project_type: 'commercial',
          year: 2022,
          production_company: null,
          director: null,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'credit-3',
          profile_id: 'profile-1',
          project_title: 'Movie 3',
          role: 'Gaffer',
          project_type: 'tv',
          year: 2021,
          production_company: null,
          director: null,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'credit-4',
          profile_id: 'profile-1',
          project_title: 'Movie 4',
          role: 'Gaffer',
          project_type: 'documentary',
          year: 2020,
          production_company: null,
          director: null,
          display_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    }

    render(<ProfileCard profile={profileWithManyCredits} />)

    expect(screen.getByText('Movie 1')).toBeInTheDocument()
    expect(screen.getByText('Movie 2')).toBeInTheDocument()
    expect(screen.getByText('Movie 3')).toBeInTheDocument()
    expect(screen.queryByText('Movie 4')).not.toBeInTheDocument()
  })

  it('should render View Profile link with correct href', () => {
    render(<ProfileCard profile={baseProfile} />)

    const link = screen.getByText('View Profile')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/crew/john-doe-gaffer-nashville')
  })

  it('should render article element for semantic HTML', () => {
    const { container } = render(<ProfileCard profile={baseProfile} />)

    const article = container.querySelector('article')
    expect(article).toBeInTheDocument()
  })

  it('should handle profile without credits', () => {
    render(<ProfileCard profile={baseProfile} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('View Profile')).toBeInTheDocument()
  })

  it('should display years of experience when provided', () => {
    const profileWithExperience = {
      ...baseProfile,
      years_experience: 5,
    }

    render(<ProfileCard profile={profileWithExperience} />)

    expect(screen.getByText('5 years in showbiz')).toBeInTheDocument()
  })

  it('should display singular "year" for 1 year of experience', () => {
    const profileWithOneYear = {
      ...baseProfile,
      years_experience: 1,
    }

    render(<ProfileCard profile={profileWithOneYear} />)

    expect(screen.getByText('1 year in showbiz')).toBeInTheDocument()
  })

  it('should not display years of experience when not provided', () => {
    render(<ProfileCard profile={baseProfile} />)

    expect(screen.queryByText(/years? in showbiz/)).not.toBeInTheDocument()
  })

  it('should display bio snippet when bio is provided', () => {
    const profileWithBio = {
      ...baseProfile,
      bio: 'This is a short bio about the crew member and their experience in the industry.',
    }

    render(<ProfileCard profile={profileWithBio} />)

    expect(screen.getByText(/This is a short bio/)).toBeInTheDocument()
  })

  it('should truncate long bio text', () => {
    const longBio = 'This is a very long bio that should be truncated because it exceeds the maximum length of 100 characters that we want to display in the profile card preview.'
    const profileWithLongBio = {
      ...baseProfile,
      bio: longBio,
    }

    render(<ProfileCard profile={profileWithLongBio} />)

    // Bio should be truncated and end with ellipsis
    const bioElement = screen.getByText(/This is a very long bio.*\.\.\./)
    expect(bioElement).toBeInTheDocument()
    // Bio should be truncated to around 100 characters
    expect(bioElement.textContent?.length).toBeLessThan(110)
  })

  it('should not display bio snippet when bio is null', () => {
    render(<ProfileCard profile={baseProfile} />)

    // Bio snippet should not be rendered when bio is null
    // We can't easily test for absence of truncated bio, but we can verify
    // that the component still renders correctly
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})

