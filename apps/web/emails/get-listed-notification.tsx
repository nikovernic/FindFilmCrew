import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { Profile } from '@crew-up/shared'

interface GetListedNotificationEmailProps {
  profile: Profile
  adminDashboardUrl: string
  idPhotoUrl?: string | null
}

export function GetListedNotificationEmail({
  profile,
  adminDashboardUrl,
  idPhotoUrl,
}: GetListedNotificationEmailProps) {
  const profileUrl = `https://findfilmcrew.com/crew/${profile.slug}`

  return (
    <Html>
      <Head />
      <Preview>New profile submission requires review: {profile.name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Profile Submission for Review</Heading>
          
          <Text style={text}>
            A new profile has been submitted and is pending review.
          </Text>

          <Section style={section}>
            <Text style={text}>
              <strong>Profile Details:</strong>
            </Text>
            <Text style={text}>
              <strong>Name:</strong> {profile.name}
            </Text>
            <Text style={text}>
              <strong>Role:</strong> {profile.primary_role}
            </Text>
            <Text style={text}>
              <strong>Location:</strong> {profile.primary_location_city}, {profile.primary_location_state}
            </Text>
            <Text style={text}>
              <strong>Contact Email:</strong> {profile.contact_email}
            </Text>
            {profile.contact_phone && (
              <Text style={text}>
                <strong>Contact Phone:</strong> {profile.contact_phone}
              </Text>
            )}
            {profile.bio && (
              <Text style={text}>
                <strong>Bio:</strong> {profile.bio}
              </Text>
            )}
            {profile.portfolio_url && (
              <Text style={text}>
                <strong>Portfolio:</strong>{' '}
                <Link href={profile.portfolio_url} style={link}>
                  {profile.portfolio_url}
                </Link>
              </Text>
            )}
            {profile.website && (
              <Text style={text}>
                <strong>Website:</strong>{' '}
                <Link href={profile.website} style={link}>
                  {profile.website}
                </Link>
              </Text>
            )}
            {profile.instagram_url && (
              <Text style={text}>
                <strong>Instagram:</strong>{' '}
                <Link href={profile.instagram_url} style={link}>
                  {profile.instagram_url}
                </Link>
              </Text>
            )}
            {profile.vimeo_url && (
              <Text style={text}>
                <strong>Vimeo:</strong>{' '}
                <Link href={profile.vimeo_url} style={link}>
                  {profile.vimeo_url}
                </Link>
              </Text>
            )}
            {profile.union_status && (
              <Text style={text}>
                <strong>Union Status:</strong> {profile.union_status}
              </Text>
            )}
            {profile.years_experience && (
              <Text style={text}>
                <strong>Years of Experience:</strong> {profile.years_experience}
              </Text>
            )}
            {idPhotoUrl && (
              <Text style={text}>
                <strong>ID Photo:</strong>{' '}
                <Link href={idPhotoUrl} style={link}>
                  View ID Photo
                </Link>
              </Text>
            )}
          </Section>

          <Section style={buttonSection}>
            <Button href={adminDashboardUrl} style={button}>
              Review Profile
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>
            <Link href={adminDashboardUrl} style={link}>
              {adminDashboardUrl}
            </Link>
          </Text>

          <Text style={footer}>
            Profile ID: {profile.id} | Status: {profile.profile_status}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Email styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 12px',
}

const section = {
  margin: '24px 0',
  padding: '0',
}

const buttonSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#2754C5',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const link = {
  color: '#2754C5',
  textDecoration: 'underline',
}

const linkText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 24px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e6ebf1',
}

