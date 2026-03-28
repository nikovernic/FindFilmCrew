-- Migration: 004_add_department_field
-- Description: Add department field to profiles table

-- Add department column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT CHECK (department IN ('camera', 'production', 'lighting', 'grip', 'art', 'sound'));

