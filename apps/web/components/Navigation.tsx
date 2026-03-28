'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Find Crew' },
]

const crewLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Find Crew' },
  { href: '/get-listed', label: 'Get Listed' },
]

const producerLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Find Crew' },
]

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      if (session) {
        setUserRole(session.user.user_metadata?.role || 'producer')
      }
    })
  }, [])

  const navLinks = !isLoggedIn ? publicLinks : userRole === 'producer' ? producerLinks : crewLinks

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-2 py-2 text-sm font-bold tracking-tight"
            >
              Film Crew Texas
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link
                href={userRole === 'producer' ? '/account' : '/profile/edit'}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                {userRole === 'producer' ? 'Account' : 'My Profile'}
              </Link>
            ) : (
              <Link
                href="/signin"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden border-t overflow-hidden transition-all duration-200',
          isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-2 space-y-0.5 bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link
              href={userRole === 'producer' ? '/account' : '/profile/edit'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {userRole === 'producer' ? 'Account' : 'My Profile'}
            </Link>
          ) : (
            <Link
              href="/signin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
