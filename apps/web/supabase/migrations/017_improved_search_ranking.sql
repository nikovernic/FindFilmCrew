-- Migration: 017_improved_search_ranking
-- Description: Rank search results by verified status, quality score
-- (credits + experience tier + profile completeness), then recency.
-- Incentivizes filling out profiles — more complete = higher ranking.

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
             coalesce(p.bio, '') || ' ' ||
             coalesce(p.primary_location_city, '') || ' ' ||
             coalesce(p.primary_location_state, '')
         ) @@ plainto_tsquery('english', search_text))
        AND (normalized_role IS NULL OR
             (LOWER(p.primary_role) LIKE '%' || normalized_role || '%' OR
              (normalized_role = 'dp' AND (
                  LOWER(p.primary_role) LIKE '%dp%' OR
                  LOWER(p.primary_role) LIKE '%director of photography%'
              ))))
        AND (filter_city IS NULL OR p.primary_location_city ILIKE '%' || filter_city || '%')
        AND (filter_state IS NULL OR UPPER(p.primary_location_state) = UPPER(filter_state))
        AND (filter_years_min IS NULL OR p.years_experience IS NULL OR p.years_experience >= filter_years_min)
        AND (filter_years_max IS NULL OR p.years_experience IS NULL OR p.years_experience <= filter_years_max)
    GROUP BY p.id
    ORDER BY
        -- 1. Verified first
        p.is_verified DESC,
        -- 2. Text relevance when searching
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
        -- 3. Quality score: credits + experience + completeness
        (
            -- Credit count (capped at 5 to avoid outliers dominating)
            LEAST(COUNT(c.id), 5) * 3 +
            -- Experience tier: 10+ yrs = 5, 5-9 = 3, 1-4 = 1, null/0 = 0
            CASE
                WHEN p.years_experience >= 10 THEN 5
                WHEN p.years_experience >= 5 THEN 3
                WHEN p.years_experience >= 1 THEN 1
                ELSE 0
            END +
            -- Profile completeness (photo & bio weighted higher)
            CASE WHEN p.photo_url IS NOT NULL THEN 2 ELSE 0 END +
            CASE WHEN p.bio IS NOT NULL AND length(p.bio) > 50 THEN 2 ELSE 0 END +
            CASE WHEN p.bio IS NOT NULL AND length(p.bio) <= 50 THEN 1 ELSE 0 END +
            CASE WHEN p.portfolio_url IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN p.website IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN p.vimeo_url IS NOT NULL THEN 1 ELSE 0 END
        ) DESC,
        -- 4. Recency as final tiebreaker
        p.updated_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$;

NOTIFY pgrst, 'reload schema';
