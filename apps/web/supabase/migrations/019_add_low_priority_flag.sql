-- Migration: 019_add_low_priority_flag
-- Description: Add is_low_priority flag to profiles.
-- Low priority profiles are approved but sort to the bottom of search results.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_low_priority BOOLEAN NOT NULL DEFAULT false;

NOTIFY pgrst, 'reload schema';
