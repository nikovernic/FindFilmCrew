-- Migration: 002_allow_public_profile_creation
-- Description: Allow unauthenticated users to create profiles (for public listing feature)

-- Allow anyone to insert profiles (for public "Get Listed" feature)
CREATE POLICY "Anyone can create profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

