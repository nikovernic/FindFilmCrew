import { redirect } from 'next/navigation'
import { Search, Users, Briefcase, MapPin, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  async function handleSearch(formData: FormData) {
    'use server'
    const query = formData.get('query') as string
    if (query && query.trim()) {
      redirect(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Star className="h-4 w-4" />
              The #1 Production Crew Database
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
              Find the Perfect{' '}
              <span className="text-gradient">Production Crew</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
              Connect with qualified crew members across the United States.
              Search by role, location, and experience in seconds.
            </p>

            {/* Search Form */}
            <form action={handleSearch} className="max-w-2xl mx-auto mb-8 animate-scale-in">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-background border rounded-xl shadow-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <label htmlFor="search-query" className="sr-only">
                    Search for crew
                  </label>
                  <input
                    id="search-query"
                    name="query"
                    type="text"
                    placeholder="Search for crew (e.g., 'gaffer in Nashville')"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-0 bg-transparent focus:ring-0 focus:outline-none text-base"
                    required
                    aria-label="Search for crew members"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 btn-press"
                >
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>
            </form>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground animate-fade-in">
              <span>Popular:</span>
              <Link href="/search?role=Gaffer" className="text-primary hover:underline">Gaffer</Link>
              <Link href="/search?role=DP" className="text-primary hover:underline">DP</Link>
              <Link href="/search?role=AC" className="text-primary hover:underline">Camera Assistant</Link>
              <Link href="/search?role=Grip" className="text-primary hover:underline">Grip</Link>
              <Link href="/search?role=Sound" className="text-primary hover:underline">Sound Mixer</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">1,000+</div>
              <div className="text-sm text-muted-foreground">Crew Members</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Markets</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">30+</div>
              <div className="text-sm text-muted-foreground">Crew Roles</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">5,000+</div>
              <div className="text-sm text-muted-foreground">Credits Listed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Crew Up?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The modern way to find and hire production crew
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Producers */}
            <div className="group relative p-8 rounded-2xl border bg-card card-hover">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Producers</h3>
              <p className="text-muted-foreground mb-4">
                Find qualified crew members in any market within minutes. View credits,
                reels, and work examples before reaching out.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center text-primary font-medium hover:gap-2 transition-all gap-1"
              >
                Find Crew <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* For Crew */}
            <div className="group relative p-8 rounded-2xl border bg-card card-hover">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Crew Members</h3>
              <p className="text-muted-foreground mb-4">
                Be discoverable by producers hiring in your market. Showcase your credits,
                reels, and receive job inquiries directly.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-primary font-medium hover:gap-2 transition-all gap-1"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Nationwide */}
            <div className="group relative p-8 rounded-2xl border bg-card card-hover">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Nationwide Coverage</h3>
              <p className="text-muted-foreground mb-4">
                Search crew members across all major production markets in the United States.
                From LA to New York and everywhere in between.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center text-primary font-medium hover:gap-2 transition-all gap-1"
              >
                Explore Markets <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Crew?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join hundreds of producers who have found their perfect crew through Crew Up.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-3 bg-background text-foreground rounded-lg hover:bg-background/90 transition-colors font-medium btn-press"
            >
              Start Searching
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 border border-primary-foreground/30 rounded-lg hover:bg-primary-foreground/10 transition-colors font-medium btn-press"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
