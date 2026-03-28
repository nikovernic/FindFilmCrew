-- Migration: 018_search_secondary_roles
-- Description: Include secondary_roles in role search.
-- Primary role matches rank above secondary role matches.
-- Also fix name search by adding ILIKE fallback alongside full-text search.

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
            -- Full-text search (for keywords, roles, bio)
            to_tsvector('english',
                coalesce(p.name, '') || ' ' ||
                coalesce(p.primary_role, '') || ' ' ||
                coalesce(p.bio, '') || ' ' ||
                coalesce(p.primary_location_city, '') || ' ' ||
                coalesce(p.primary_location_state, '')
            ) @@ plainto_tsquery('english', search_text)
            OR
            -- ILIKE fallback for name matching (handles partial names, proper nouns)
            p.name ILIKE '%' || search_text || '%'
        )
        AND (normalized_role IS NULL OR
             -- Match primary role
             (LOWER(p.primary_role) LIKE '%' || normalized_role || '%' OR
              (normalized_role = 'dp' AND (
                  LOWER(p.primary_role) LIKE '%dp%' OR
                  LOWER(p.primary_role) LIKE '%director of photography%'
              )))
             OR
             -- Match secondary roles
             EXISTS (
                 SELECT 1 FROM unnest(p.secondary_roles) AS sr
                 WHERE LOWER(sr) LIKE '%' || normalized_role || '%'
                    OR (normalized_role = 'dp' AND (
                        LOWER(sr) LIKE '%dp%' OR
                        LOWER(sr) LIKE '%director of photography%'
                    ))
             ))
        AND (filter_city IS NULL OR p.primary_location_city ILIKE '%' || filter_city || '%')
        AND (filter_state IS NULL OR UPPER(p.primary_location_state) = UPPER(filter_state))
        AND (filter_years_min IS NULL OR p.years_experience IS NULL OR p.years_experience >= filter_years_min)
        AND (filter_years_max IS NULL OR p.years_experience IS NULL OR p.years_experience <= filter_years_max)
    GROUP BY p.id
    ORDER BY
        -- 1. Low priority profiles go to the bottom
        COALESCE(p.is_low_priority, false) ASC,
        -- 2. Verified first
        p.is_verified DESC,
        -- 3. Exact name match first when searching by text
        CASE
            WHEN search_text IS NOT NULL AND search_text != '' AND
                 p.name ILIKE '%' || search_text || '%' THEN 0
            ELSE 1
        END ASC,
        -- 4. Primary role match before secondary role match
        CASE
            WHEN normalized_role IS NOT NULL AND (
                LOWER(p.primary_role) LIKE '%' || normalized_role || '%'
                OR (normalized_role = 'dp' AND (
                    LOWER(p.primary_role) LIKE '%dp%' OR
                    LOWER(p.primary_role) LIKE '%director of photography%'
                ))
            ) THEN 0
            WHEN normalized_role IS NOT NULL THEN 1
            ELSE 0
        END ASC,
        -- 5. Text relevance when searching
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
        -- 6. Quality score: credits + experience + completeness
        (
            LEAST(COUNT(c.id), 5) * 3 +
            CASE
                WHEN p.years_experience >= 10 THEN 5
                WHEN p.years_experience >= 5 THEN 3
                WHEN p.years_experience >= 1 THEN 1
                ELSE 0
            END +
            CASE WHEN p.photo_url IS NOT NULL THEN 2 ELSE 0 END +
            CASE WHEN p.bio IS NOT NULL AND length(p.bio) > 50 THEN 2 ELSE 0 END +
            CASE WHEN p.bio IS NOT NULL AND length(p.bio) <= 50 THEN 1 ELSE 0 END +
            CASE WHEN p.portfolio_url IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN p.website IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN p.vimeo_url IS NOT NULL THEN 1 ELSE 0 END
        ) DESC,
        -- 7. Recency as final tiebreaker
        p.updated_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$;

-- Also update the count function to match
DROP FUNCTION IF EXISTS public.search_profiles_count(TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER);

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
    normalized_role TEXT;
    result_count INTEGER;
BEGIN
    IF filter_role IS NOT NULL THEN
        normalized_role := LOWER(TRIM(filter_role));
        IF normalized_role = 'dp' OR
           normalized_role = 'director of photography' OR
           normalized_role = 'director of photography (dp)' THEN
            normalized_role := 'dp';
        END IF;
    END IF;

    SELECT COUNT(DISTINCT p.id) INTO result_count
    FROM public.profiles p
    WHERE
        p.profile_status = 'approved'
        AND (search_text IS NULL OR search_text = '' OR
            to_tsvector('english',
                coalesce(p.name, '') || ' ' ||
                coalesce(p.primary_role, '') || ' ' ||
                coalesce(p.bio, '') || ' ' ||
                coalesce(p.primary_location_city, '') || ' ' ||
                coalesce(p.primary_location_state, '')
            ) @@ plainto_tsquery('english', search_text)
            OR
            p.name ILIKE '%' || search_text || '%'
        )
        AND (normalized_role IS NULL OR
             (LOWER(p.primary_role) LIKE '%' || normalized_role || '%' OR
              (normalized_role = 'dp' AND (
                  LOWER(p.primary_role) LIKE '%dp%' OR
                  LOWER(p.primary_role) LIKE '%director of photography%'
              )))
             OR
             EXISTS (
                 SELECT 1 FROM unnest(p.secondary_roles) AS sr
                 WHERE LOWER(sr) LIKE '%' || normalized_role || '%'
                    OR (normalized_role = 'dp' AND (
                        LOWER(sr) LIKE '%dp%' OR
                        LOWER(sr) LIKE '%director of photography%'
                    ))
             ))
        AND (filter_city IS NULL OR p.primary_location_city ILIKE '%' || filter_city || '%')
        AND (filter_state IS NULL OR UPPER(p.primary_location_state) = UPPER(filter_state))
        AND (filter_years_min IS NULL OR p.years_experience IS NULL OR p.years_experience >= filter_years_min)
        AND (filter_years_max IS NULL OR p.years_experience IS NULL OR p.years_experience <= filter_years_max);

    RETURN result_count;
END;
$$;

NOTIFY pgrst, 'reload schema';
