import Link from 'next/link'
import { HomeSearchForm } from '@/components/search/HomeSearchForm'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/constants/crewRoles'

export const dynamic = 'force-dynamic'

async function getDistinctRoles(): Promise<string[]> {
  const supabase = createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('primary_role, secondary_roles')
    .eq('profile_status', 'approved')

  if (!profiles) return []

  const roleSet = new Set<string>()
  profiles.forEach((p) => {
    if (p.primary_role) {
      roleSet.add(normalizeRole(p.primary_role))
    }
    if (p.secondary_roles && Array.isArray(p.secondary_roles)) {
      p.secondary_roles.forEach((r: string) => {
        if (r) roleSet.add(normalizeRole(r))
      })
    }
  })

  return Array.from(roleSet).sort()
}

export default async function HomePage() {
  const roles = await getDistinctRoles()

  return (
    <>
      {/* Hero Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Texas Crew Directory
            </h1>

            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Find talented folks in Texas. Our crew rocks.
            </p>

            <HomeSearchForm />

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-4">
              <span>Find:</span>
              {roles.map((role) => (
                <Link key={role} href={`/search?role=${encodeURIComponent(role)}`} className="hover:underline">
                  {role}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info + Stats */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-center">
            <div>
              <h3 className="font-semibold mb-2">For Producers</h3>
              <p className="text-muted-foreground">
                Find great crew.
              </p>
              <Link href="/search" className="text-sm underline mt-2 inline-block">
                Find Crew
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground">Questions? Need help getting listed?</p>
              <a href="mailto:findfilmcrewtexas@gmail.com" className="text-sm underline mt-2 inline-block hover:text-foreground transition-colors">
                findfilmcrewtexas@gmail.com
              </a>
            </div>
            <div>
              <h3 className="font-semibold mb-2">For Crew Members</h3>
              <p className="text-muted-foreground">
                Get discovered by producers.
              </p>
              <Link href="/get-listed" className="text-sm underline mt-2 inline-block">
                Get Listed
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
