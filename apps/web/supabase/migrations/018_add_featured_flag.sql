-- Migration: 018_add_featured_flag
-- Description: Add is_featured boolean to profiles and update search ranking
-- to put featured profiles at the very top.

-- Add the column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Recreate search function with featured ranking
DROP FUNCTION IF EXISTS public.search_profiles(TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.search_profiles(
    search_text TEXT DEFAULT NULL,
    filter_role TEXT DEFAULT NULL,
    filter_city TEXT DEFAULT NULL,
    filter_state TEXT DEFAULT NULL,
    filter_years_min INTEGER DEFAULT NULL,
    filter_years_max INTEGER DEFAULT NULL,
    result_limit INTEGER DEFAULT 20,
    result_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    normalized_role TEXT;
BEGIN
    IF filter_role IS NOT NULL THEN
        normalized_role := LOWER(TRIM(filter_role));
        IF normalized_role = 'dp' OR
           normalized_role = 'director of photography' OR
           normalized_role = 'director of photography (dp)' THEN
            normalized_role := 'dp';
        END IF;
    END IF;

    RETURN QUERY
    SELECT p.*
    FROM public.profiles p
    LEFT JOIN public.credits c ON c.profile_id = p.id
    WHERE
        p.profile_status = 'approved'
        AND (search_text IS NULL OR search_text = '' OR
         to_tsvector('english',
             coalesce(p.name, '') || ' ' ||
             coalesce(p.primary_role, '') || ' ' ||
             coalesce(array_to_string(p.secondary_roles, ' '), '') || ' ' ||
             coalesce(p.bio, '') || ' ' ||
             coalesce(p.primary_location_city, '') || ' ' ||
             coalesce(p.primary_location_state, '')
         ) @@ plainto_tsquery('english', search_text))
        AND (normalized_role IS NULL OR
             (LOWER(p.primary_role) LIKE '%' || normalized_role || '%' OR
              EXISTS (
                  SELECT 1 FROM unnest(p.secondary_roles) AS sr
                  WHERE LOWER(sr) LIKE '%' || normalized_role || '%'
              ) OR
              (normalized_role = 'dp' AND (
                  LOWER(p.primary_role) LIKE '%dp%' OR
                  LOWER(p.primary_role) LIKE '%director of photography%' OR
                  EXISTS (
                      SELECT 1 FROM unnest(p.secondary_roles) AS sr
                      WHERE LOWER(sr) LIKE '%dp%' OR LOWER(sr) LIKE '%director of photography%'
                  )
              ))))
        AND (filter_city IS NULL OR p.primary_location_city ILIKE '%' || filter_city || '%')
        AND (filter_state IS NULL OR UPPER(p.primary_location_state) = UPPER(filter_state))
        AND (filter_years_min IS NULL OR (p.years_experience IS NOT NULL AND p.years_experience >= filter_years_min))
        AND (filter_years_max IS NULL OR (p.years_experience IS NOT NULL AND p.years_experience <= filter_years_max))
    GROUP BY p.id
    ORDER BY
        -- 1. Verified first
        p.is_verified DESC,
        -- 2. Featured next (admin-curated)
        p.is_featured DESC,
        -- 3. Text relevance when searching
        CASE
            WHEN search_text IS NOT NULL AND search_text != '' THEN
                ts_rank(to_tsvector('english',
                    coalesce(p.name, '') || ' ' ||
                    coalesce(p.primary_role, '') || ' ' ||
                    coalesce(array_to_string(p.secondary_roles, ' '), '') || ' ' ||
                    coalesce(p.bio, '') || ' ' ||
                    coalesce(p.primary_location_city, '') || ' ' ||
                    coalesce(p.primary_location_state, '')
                ), plainto_tsquery('english', search_text))
            ELSE 0
        END DESC,
        -- 4. Quality score
        (
            -- Contact info (highest weight — makes them actually reachable)
            CASE WHEN p.contact_email IS NOT NULL AND p.contact_email != '' THEN 5 ELSE 0 END +
            CASE WHEN p.contact_phone IS NOT NULL AND p.contact_phone != '' THEN 3 ELSE 0 END +
            -- Credits
            LEAST(COUNT(c.id), 5) * 3 +
            -- Experience tier
            CASE
                WHEN p.years_experience >= 10 THEN 5
                WHEN p.years_experience >= 5 THEN 3
                WHEN p.years_experience >= 1 THEN 1
                ELSE 0
            END +
            -- Profile completeness
            CASE WHEN p.photo_url IS NOT NULL THEN 2 ELSE 0 END +
            CASE WHEN p.bio IS NOT NULL AND length(p.bio) > 50 THEN 2 ELSE 0 END +
            CASE WHEN p.bio IS NOT NULL AND length(p.bio) <= 50 THEN 1 ELSE 0 END +
            CASE WHEN p.portfolio_url IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN p.website IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN p.vimeo_url IS NOT NULL THEN 1 ELSE 0 END
        ) DESC,
        -- 5. Recency
        p.updated_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$;

NOTIFY pgrst, 'reload schema';
