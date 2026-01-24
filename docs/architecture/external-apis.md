# External APIs


## Resend Email API

- **Purpose:** Send transactional emails (claim invitations, contact notifications, reminders)
- **Documentation:** https://resend.com/docs
- **Base URL(s):** `https://api.resend.com`
- **Authentication:** API key in environment variable
- **Rate Limits:** 100 emails/day on free tier, 50,000/month on paid plans

**Key Endpoints Used:**
- `POST /emails` - Send email with React Email template

**Integration Notes:**
- Use React Email for template design
- Store API key in Vercel environment variables
- Implement retry logic for failed sends
- Log all email sends for debugging

## Supabase APIs

- **Purpose:** Database queries, file storage, authentication
- **Documentation:** https://supabase.com/docs
- **Base URL(s):** Project-specific Supabase URL
- **Authentication:** Service role key for server-side, anon key for client
- **Rate Limits:** Based on Supabase plan (generous on free tier)

**Key Endpoints Used:**
- PostgreSQL: Direct SQL queries via Supabase client
- Storage API: Upload/download profile photos
- Auth API: User authentication and session management

**Integration Notes:**
- Use Supabase client library for type-safe queries
- Implement Row Level Security (RLS) policies for data access
- Use service role key only in API routes (never expose to client)

