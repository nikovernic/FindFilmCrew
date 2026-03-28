import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="font-medium text-foreground">Film Crew Texas</span>
            <span>&copy; {currentYear}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/search" className="hover:text-foreground transition-colors">Find Crew</Link>
            <Link href="/get-listed" className="hover:text-foreground transition-colors">Get Listed</Link>
            <a href="mailto:hello@crewup.com" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
