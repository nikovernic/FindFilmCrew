-- Migration: 009_update_department_constraint
-- Description: Update department constraint to include 'wardrobe' and 'hmu'

-- Drop the existing check constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_department_check;

-- Add new check constraint with all departments including wardrobe and hmu
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_department_check 
CHECK (department IN ('camera', 'production', 'lighting', 'grip', 'art', 'sound', 'wardrobe', 'hmu'));

