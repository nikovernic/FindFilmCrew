# Third-Party Service Setup Guide
## Crew Up - Service Configuration

This guide provides step-by-step instructions for setting up the third-party services required for Crew Up.

---

## Supabase Setup

### 1. Create Supabase Project

1. **Sign up/Login:**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account or log in

2. **Create New Project:**
   - Click "New Project" in the dashboard
   - Fill in project details:
     - **Name:** `crew-up` (or your preferred name)
     - **Database Password:** Generate a strong password (save this securely)
     - **Region:** Select closest to your primary users (US East recommended for US-based crew)
     - **Pricing Plan:** Free tier is sufficient for MVP

3. **Wait for Project Creation:**
   - Project creation takes 1-2 minutes
   - You'll receive a notification when ready

### 2. Get API Keys

1. **Navigate to Project Settings:**
   - Click on your project in the dashboard
   - Go to Settings → API

2. **Copy Required Keys:**
   - **Project URL:** Copy the "Project URL" (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key:** Copy the "anon public" key
   - **service_role key:** Copy the "service_role" key (⚠️ Keep this secret - never expose to client)

3. **Store in Environment Variables:**
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Backend (same file, server-side only)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 3. Set Up Database Schema

1. **Open SQL Editor:**
   - In Supabase dashboard, go to SQL Editor
   - Click "New Query"

2. **Run Schema Migration:**
   - Copy the SQL schema from `docs/architecture.md` (Database Schema section)
   - Paste into SQL Editor
   - Click "Run" to execute
   - Verify tables are created: `users`, `profiles`, `credits`, `contact_inquiries`

3. **Verify Row Level Security (RLS):**
   - Go to Authentication → Policies
   - Verify RLS policies are enabled for all tables
   - Review policies match the architecture document

### 4. Set Up Storage Bucket

1. **Create Storage Bucket:**
   - Go to Storage in Supabase dashboard
   - Click "Create Bucket"
   - **Name:** `profile-photos`
   - **Public:** Yes (for public profile photos)
   - **File size limit:** 5MB (adjustable)
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`

2. **Set Storage Policies:**
   - Go to Storage → Policies
   - Create policy: "Anyone can view profile photos"
     - Policy name: `Public read access`
     - Allowed operation: `SELECT`
     - Policy definition: `true`
   - Create policy: "Authenticated users can upload"
     - Policy name: `Authenticated upload`
     - Allowed operation: `INSERT`
     - Policy definition: `auth.role() = 'authenticated'`

### 5. Configure Authentication

1. **Enable Email Auth:**
   - Go to Authentication → Providers
   - Ensure "Email" provider is enabled
   - Configure email templates (optional for MVP)

2. **Set Up Custom User Metadata:**
   - The `users` table will be extended with a `role` field
   - This is handled in the application code (see architecture)

### 6. Test Connection

1. **Test from Local Environment:**
   ```bash
   # In your project root
   npm install @supabase/supabase-js
   
   # Create test file: test-supabase.js
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   )
   
   // Test connection
   const { data, error } = await supabase.from('profiles').select('count')
   console.log('Connection test:', error ? 'Failed' : 'Success')
   ```

---

## Resend Email Setup

### 1. Create Resend Account

1. **Sign up:**
   - Go to [https://resend.com](https://resend.com)
   - Click "Sign Up" and create a free account
   - Verify your email address

2. **Verify Domain (Optional for MVP):**
   - For MVP, you can use Resend's default domain (`onboarding.resend.dev`)
   - For production, verify your own domain (recommended)
   - Go to Domains → Add Domain and follow verification steps

### 2. Get API Key

1. **Navigate to API Keys:**
   - In Resend dashboard, go to API Keys
   - Click "Create API Key"

2. **Configure API Key:**
   - **Name:** `crew-up-production` (or `crew-up-development`)
   - **Permission:** Full access (for MVP)
   - **Environment:** Select appropriate environment

3. **Copy API Key:**
   - ⚠️ **Important:** Copy the key immediately - it won't be shown again
   - Store securely

4. **Add to Environment Variables:**
   ```bash
   # Backend (.env.local)
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

### 3. Set Up Email Templates

1. **Install React Email (Recommended):**
   ```bash
   npm install react-email @react-email/components
   ```

2. **Create Email Templates:**
   - Create templates for:
     - Claim invitation email
     - Contact notification email
     - Claim reminder email
   - Store in `apps/web/emails/` directory

3. **Example Template Structure:**
   ```
   apps/web/emails/
   ├── claim-invitation.tsx
   ├── contact-notification.tsx
   └── claim-reminder.tsx
   ```

### 4. Test Email Sending

1. **Test from Local Environment:**
   ```typescript
   // test-email.ts
   import { Resend } from 'resend'
   
   const resend = new Resend(process.env.RESEND_API_KEY)
   
   const { data, error } = await resend.emails.send({
     from: 'Crew Up <onboarding@resend.dev>',
     to: ['your-email@example.com'],
     subject: 'Test Email',
     html: '<p>This is a test email from Crew Up</p>',
   })
   
   console.log('Email test:', error ? 'Failed' : 'Success', data)
   ```

### 5. Configure Rate Limits

1. **Understand Limits:**
   - Free tier: 100 emails/day
   - Paid tier: 50,000 emails/month
   - Plan accordingly for claim reminders and contact notifications

2. **Implement Queue (Optional for MVP):**
   - For MVP, direct sending is acceptable
   - For production, consider email queue for reliability

---

## Vercel Setup (Deployment)

### 1. Create Vercel Account

1. **Sign up:**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign up with GitHub (recommended for CI/CD)

2. **Install Vercel CLI (Optional):**
   ```bash
   npm install -g vercel
   ```

### 2. Connect Repository

1. **Import Project:**
   - In Vercel dashboard, click "Add New Project"
   - Connect your GitHub repository
   - Select the `crew-up` repository

2. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web` (if monorepo)
   - **Build Command:** `pnpm build` (or `npm run build`)
   - **Output Directory:** `.next` (default)

### 3. Set Environment Variables

1. **Add Environment Variables:**
   - In Vercel project settings, go to Environment Variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `RESEND_API_KEY`
     - `DATABASE_URL` (if needed)

2. **Set for Each Environment:**
   - Production
   - Preview
   - Development

### 4. Deploy

1. **First Deployment:**
   - Push to `main` branch triggers automatic deployment
   - Or click "Deploy" in Vercel dashboard

2. **Verify Deployment:**
   - Check deployment logs for errors
   - Test the deployed application
   - Verify environment variables are loaded

---

## Troubleshooting

### Supabase Issues

**Problem: Connection timeout**
- Check if project is paused (free tier pauses after inactivity)
- Verify API keys are correct
- Check network/firewall settings

**Problem: RLS policies blocking queries**
- Review RLS policies in Supabase dashboard
- Check if user is authenticated when required
- Verify policy definitions match architecture

**Problem: Storage upload fails**
- Verify bucket exists and is public (if needed)
- Check file size limits
- Verify MIME type is allowed

### Resend Issues

**Problem: Emails not sending**
- Verify API key is correct
- Check rate limits (free tier: 100/day)
- Verify "from" email is valid
- Check Resend dashboard for error logs

**Problem: Emails going to spam**
- Use verified domain (not `onboarding.resend.dev`)
- Set up SPF/DKIM records
- Avoid spam trigger words in subject/content

### Vercel Issues

**Problem: Build fails**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check for TypeScript errors
- Verify dependencies are installed

**Problem: Environment variables not loading**
- Verify variables are set for correct environment
- Check variable names match code exactly
- Redeploy after adding variables

---

## Security Best Practices

1. **Never commit API keys:**
   - Use `.env.local` for local development
   - Add `.env.local` to `.gitignore`
   - Use Vercel environment variables for production

2. **Rotate keys regularly:**
   - Change API keys if compromised
   - Use different keys for dev/staging/production

3. **Limit service role key access:**
   - Only use service role key in server-side code
   - Never expose in client-side JavaScript
   - Use anon key for client-side operations

4. **Monitor usage:**
   - Set up alerts for unusual activity
   - Monitor API rate limits
   - Track email sending volumes

---

## Next Steps

After completing setup:

1. ✅ Verify all services are connected
2. ✅ Test database queries
3. ✅ Test email sending
4. ✅ Verify environment variables in Vercel
5. ✅ Run initial database migration
6. ✅ Test authentication flow
7. ✅ Proceed with Epic 1 development

---

**Last Updated:** December 12, 2024  
**Maintained By:** Development Team

