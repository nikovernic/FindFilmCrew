-- Migration: 010_add_imdb_url
-- Description: Add imdb_url field to profiles table

-- Add imdb_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS imdb_url TEXT;

