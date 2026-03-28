-- Migration: 011_add_credits_text_field
-- Description: Add credits text field to profiles table

-- Add credits column to profiles table (text field for free-form credits entry)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits TEXT;

