-- Migration: 013_create_admin_user
-- Description: Create admin user for niko.vernic@gmail.com
-- Note: User must be created in Supabase Auth first (via signup or dashboard)

-- Function to create/update admin user
-- This will work once the user exists in auth.users
DO $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Find the user in auth.users by email
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'niko.vernic@gmail.com'
    LIMIT 1;

    -- If user exists in auth.users, create/update in public.users with admin role
    IF auth_user_id IS NOT NULL THEN
        INSERT INTO public.users (id, email, role, created_at, updated_at)
        VALUES (auth_user_id, 'niko.vernic@gmail.com', 'admin', NOW(), NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            email = 'niko.vernic@gmail.com',
            updated_at = NOW();
        
        RAISE NOTICE 'Admin user created/updated for niko.vernic@gmail.com';
    ELSE
        RAISE WARNING 'User niko.vernic@gmail.com not found in auth.users. Please create the user in Supabase Auth first, then re-run this migration.';
    END IF;
END $$;

