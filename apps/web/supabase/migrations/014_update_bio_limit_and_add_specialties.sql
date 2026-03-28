-- Migration: 014_update_bio_limit_and_add_specialties
-- Description: Update bio character limit from 250 to 2000 and add specialties field

-- Drop existing bio constraint (if it exists, may be unnamed)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_bio_check;

-- Add new bio constraint with 2000 character limit
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_bio_check 
CHECK (bio IS NULL OR char_length(bio) <= 2000);

-- Add specialties column as TEXT array (similar to secondary_roles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS specialties TEXT[];

