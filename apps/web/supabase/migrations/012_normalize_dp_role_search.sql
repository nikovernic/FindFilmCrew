-- Migration: 012_normalize_dp_role_search
-- Description: Normalize DP and Director of Photography in role search to treat them as the same

-- Drop existing functions first (required when return type changes)
DROP FUNCTION IF EXISTS public.search_profiles(
    TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER
);
DROP FUNCTION IF EXISTS public.search_profiles_count(
    TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER
);

-- Recreate search_profiles function to normalize DP role variants
CREATE FUNCTION public.search_profiles(
    search_text TEXT DEFAULT NULL,
    filter_role TEXT DEFAULT NULL,
    filter_city TEXT DEFAULT NULL,
    filter_state TEXT DEFAULT NULL,
    filter_years_min INTEGER DEFAULT NULL,
    filter_years_max INTEGER DEFAULT NULL,
    result_limit INTEGER DEFAULT 20,
    result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name TEXT,
    primary_role TEXT,
    primary_location_city TEXT,
    primary_location_state TEXT,
    bio TEXT,
    photo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    portfolio_url TEXT,
    website TEXT,
    instagram_url TEXT,
    vimeo_url TEXT,
    union_status TEXT,
    years_experience INTEGER,
    secondary_roles TEXT[],
    additional_markets JSONB,
    is_claimed BOOLEAN,
    claim_token TEXT,
    claim_token_expires_at TIMESTAMPTZ,
    reminder_sent_at_7days TIMESTAMPTZ,
    reminder_sent_at_14days TIMESTAMPTZ,
    profile_status TEXT,
    is_verified BOOLEAN,
    verification_id_url TEXT,
    verification_requested_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    slug TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    normalized_role TEXT;
BEGIN
    -- Normalize role filter to handle DP variants
    IF filter_role IS NOT NULL THEN
        normalized_role := LOWER(TRIM(filter_role));
        -- Normalize DP and Director of Photography variants
        IF normalized_role = 'dp' OR 
           normalized_role = 'director of photography' OR 
           normalized_role = 'director of photography (dp)' THEN
            -- Search for all DP variants
            normalized_role := 'dp';
        ELSE
            normalized_role := filter_role;
        END IF;
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.name,
        p.primary_role,
        p.primary_location_city,
        p.primary_location_state,
        p.bio,
        p.photo_url,
        p.contact_email,
        p.contact_phone,
        p.portfolio_url,
        p.website,
        p.instagram_url,
        p.vimeo_url,
        p.union_status,
        p.years_experience,
        p.secondary_roles,
        p.additional_markets,
        p.is_claimed,
        p.claim_token,
        p.claim_token_expires_at,
        p.reminder_sent_at_7days,
        p.reminder_sent_at_14days,
        p.profile_status,
        p.is_verified,
        p.verification_id_url,
        p.verification_requested_at,
        p.verified_at,
        p.slug,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE
        -- Only show approved profiles
        p.profile_status = 'approved'
        -- Full-text search using GIN index
        AND (search_text IS NULL OR search_text = '' OR
         to_tsvector('english',
             coalesce(p.name, '') || ' ' ||
             coalesce(p.primary_role, '') || ' ' ||
             coalesce(p.bio, '') || ' ' ||
             coalesce(p.primary_location_city, '') || ' ' ||
             coalesce(p.primary_location_state, '')
         ) @@ plainto_tsquery('english', search_text))
        -- Role filter with DP normalization
        AND (normalized_role IS NULL OR 
             (LOWER(p.primary_role) LIKE '%' || normalized_role || '%' OR
              (normalized_role = 'dp' AND (
                  LOWER(p.primary_role) LIKE '%dp%' OR 
                  LOWER(p.primary_role) LIKE '%director of photography%'
              ))))
        -- City filter
        AND (filter_city IS NULL OR p.primary_location_city ILIKE '%' || filter_city || '%')
        -- State filter (exact match, case-insensitive)
        AND (filter_state IS NULL OR UPPER(p.primary_location_state) = UPPER(filter_state))
        -- Years experience filter
        AND (filter_years_min IS NULL OR p.years_experience IS NULL OR p.years_experience >= filter_years_min)
        AND (filter_years_max IS NULL OR p.years_experience IS NULL OR p.years_experience <= filter_years_max)
    ORDER BY 
        -- Verified profiles first
        p.is_verified DESC,
        -- Then by relevance if search text provided, otherwise by updated_at
        CASE 
            WHEN search_text IS NOT NULL AND search_text != '' THEN
                ts_rank(to_tsvector('english',
                    coalesce(p.name, '') || ' ' ||
                    coalesce(p.primary_role, '') || ' ' ||
                    coalesce(p.bio, '') || ' ' ||
                    coalesce(p.primary_location_city, '') || ' ' ||
                    coalesce(p.primary_location_state, '')
                ), plainto_tsquery('english', search_text))
            ELSE 0
        END DESC,
        p.updated_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$;

-- Update search_profiles_count function with same normalization
CREATE OR REPLACE FUNCTION public.search_profiles_count(
    search_text TEXT DEFAULT NULL,
    filter_role TEXT DEFAULT NULL,
    filter_city TEXT DEFAULT NULL,
    filter_state TEXT DEFAULT NULL,
    filter_years_min INTEGER DEFAULT NULL,
    filter_years_max INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    result_count INTEGER;
    normalized_role TEXT;
BEGIN
    -- Normalize role filter to handle DP variants
    IF filter_role IS NOT NULL THEN
        normalized_role := LOWER(TRIM(filter_role));
        -- Normalize DP and Director of Photography variants
        IF normalized_role = 'dp' OR 
           normalized_role = 'director of photography' OR 
           normalized_role = 'director of photography (dp)' THEN
            -- Search for all DP variants
            normalized_role := 'dp';
        ELSE
            normalized_role := filter_role;
        END IF;
    END IF;

    SELECT COUNT(*) INTO result_count
    FROM public.profiles p
    WHERE
        -- Only count approved profiles
        p.profile_status = 'approved'
        -- Full-text search using GIN index
        AND (search_text IS NULL OR search_text = '' OR
         to_tsvector('english',
             coalesce(p.name, '') || ' ' ||
             coalesce(p.primary_role, '') || ' ' ||
             coalesce(p.bio, '') || ' ' ||
             coalesce(p.primary_location_city, '') || ' ' ||
             coalesce(p.primary_location_state, '')
         ) @@ plainto_tsquery('english', search_text))
        -- Role filter with DP normalization
        AND (normalized_role IS NULL OR 
             (LOWER(p.primary_role) LIKE '%' || normalized_role || '%' OR
              (normalized_role = 'dp' AND (
                  LOWER(p.primary_role) LIKE '%dp%' OR 
                  LOWER(p.primary_role) LIKE '%director of photography%'
              ))))
        -- City filter
        AND (filter_city IS NULL OR p.primary_location_city ILIKE '%' || filter_city || '%')
        -- State filter (exact match, case-insensitive)
        AND (filter_state IS NULL OR UPPER(p.primary_location_state) = UPPER(filter_state))
        -- Years experience filter
        AND (filter_years_min IS NULL OR p.years_experience IS NULL OR p.years_experience >= filter_years_min)
        AND (filter_years_max IS NULL OR p.years_experience IS NULL OR p.years_experience <= filter_years_max);
    
    RETURN result_count;
END;
$$;

