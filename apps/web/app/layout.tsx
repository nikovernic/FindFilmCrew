import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Providers } from '@/components/Providers'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: {
    default: 'Find Film Crew in Texas | Camera Operators, DPs, Gaffers & More',
    template: '%s | Find Film Crew Texas',
  },
  description: 'Search 1,200+ Texas film crew members. Find camera operators, DPs, gaffers, grips, sound mixers, and more in Austin, Dallas, Houston, and San Antonio.',
  metadataBase: new URL('https://www.findfilmcrewtexas.com'),
  openGraph: {
    siteName: 'Find Film Crew Texas',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://bjnfxzznblopuccuthpb.supabase.co" />
      </head>
      <body className={`min-h-screen flex flex-col ${dmSans.className}`}>
        <Providers>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
