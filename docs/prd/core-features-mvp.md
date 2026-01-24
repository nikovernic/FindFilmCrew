# Core Features (MVP)

Core Features (MVP)
1. Crew Profile System
Profile Fields
Required:
Full Name
Primary Role/Title (e.g., "1st AC", "Gaffer", "Sound Mixer")
Primary Location (City, State)
Contact Method (Email and/or Phone)
Optional but Recommended:
Profile Photo
Bio/About (250 chars max for MVP)
Secondary Roles
Additional Markets/Locations
Years of Experience
Union Affiliation (IATSE, SAG-AFTRA, etc.)
Portfolio/Reel URL
Website
Social Links (Instagram, Vimeo, etc.)
Credits Section:
Project Title
Role on Project
Project Type (Commercial, Feature Film, Documentary, Music Video, etc.)
Year
Optional: Production Company, Director
Should be able to upload a CV or imdb to pull from
Optional for Later:
Day Rate Range (consider for post-paywall)
Availability Calendar
Equipment Owned
Certifications
Profile URLs
Clean, SEO-friendly URLs: /crew/[name]-[role]-[city]
Example: /crew/sarah-martinez-gaffer-nashville

2. Search & Discovery
Primary Search Interface
Search Input:
Free-text search with intelligent parsing
Example queries: "AC in Nashville", "gaffer Atlanta", "sound mixer Tennessee"
Filters (Progressive Disclosure):
Location (City, State, Region)
Role/Position
Union Status (Union, Non-Union, Either)
Experience Level (Entry, Mid, Senior)
Availability (Available Now, By Date Range - post-MVP)
Search Results Display:
Card-based layout
Shows: Name, Photo, Primary Role, Location, Top 3 Credits
Clear CTA: "View Profile" or "Contact"
Pagination (20 results per page initially)
SEO Optimization (Critical)
Technical Requirements:
Server-side rendering (SSR) for all crew profile pages
Semantic HTML with proper schema markup (Schema.org Person/Service)
Optimized meta tags per profile (title, description, OG tags)
Clean URL structure with target keywords
Fast page load times (<2s)
Mobile-responsive design
XML sitemap auto-generation
Robots.txt optimization
Content Strategy:
Individual profile pages are primary SEO targets
Each profile optimized for "[role] in [city]" queries
Location-based landing pages (e.g., "/crew/nashville-tennessee")
Role-based landing pages (e.g., "/crew/gaffers")

3. Contact Flow
For Producers (No Login Required for MVP):
Click "Contact" on crew profile
Simple form appears:
Producer Name
Email
Phone (optional)
Project Details (textarea, 500 chars max)
Shoot Dates (optional)
For Crew Members:
Click "Contact" on crew profile
Simple form appears:
Crew Name
Email
Phone 
Role, experience, etc. 
Optional Enhancement (Post-MVP):
In-platform messaging system
Inquiry tracking dashboard for crew

4. Profile Claiming System
Initial State:
Admin creates profile on behalf of crew member
Profile marked as "Unclaimed"
Verification token generated
Claim Flow:
Crew receives email: "Your profile has been created on Crew Up"
OR CREW CAN CLICK A CLAIM PROFILE BUTTON ON SITE
Email contains unique claim link with token
Crew clicks link → Verification page
Verification options:
Email verification (simplest for MVP)
Confirm name + primary email matches
Optional: Upload verification document if email doesn't match (e.g., crew resume/call sheet)
Set password
Profile now "Claimed" - crew has full editing access
Claim Invite Reminder System:
Reminder email sent after 7 days if unclaimed
Second reminder at 14 days
Profile remains live and searchable even if unclaimed
Get Listed System
Crew can click a get listed / sign up button that links to them creating an account with all the needed fields

5. Admin Dashboard
Core Admin Functions:
Add new crew profile (form-based)
Bulk import crew (CSV upload with mapping)
Edit any profile
Delete/Archive profiles
View claim status of all profiles
Send/Resend claim invitations
Search admin panel (find crew quickly for editing)
Quality Control:
Flag profiles for review
Merge duplicate profiles
Basic analytics dashboard:
Total profiles
Claimed vs. Unclaimed
Search queries (top 50)
Contact form submissions

6. Public Pages
Homepage:
Hero section with main search bar
Value proposition: "Find production crew across the US"
Featured crew or recent additions (6-8 profiles)
Location directory (major cities)
Role directory (major positions)
Location Pages:
/crew/[city]-[state]
Example: /crew/nashville-tennessee
Shows all crew in that location
Filterable by role
SEO-optimized for location-based searches
Role Pages:
/crew/[role-plural]
Example: /crew/gaffers
Shows all crew with that primary role
Filterable by location
SEO-optimized for role-based searches
About Page:
Platform story and mission
How it works (for producers and crew)
Contact information