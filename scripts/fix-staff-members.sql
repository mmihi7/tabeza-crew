-- Fix staff_members records for specific user IDs
-- Run this in Supabase SQL Editor

-- Check and create staff_members for user 7952b427-293f-4698-9899-64648af051c6
DO $$
DECLARE
  v_user_id UUID := '7952b427-293f-4698-9899-64648af051c6';
  v_user_email TEXT;
  v_user_metadata JSONB;
  v_display_name TEXT;
  v_phone_number TEXT;
BEGIN
  -- Get user from auth.users
  SELECT email, raw_user_meta_data 
  INTO v_user_email, v_user_metadata
  FROM auth.users 
  WHERE id = v_user_id;
  
  IF v_user_email IS NULL THEN
    RAISE NOTICE 'User % not found in auth.users', v_user_id;
  ELSE
    -- Extract display name from metadata
    v_display_name := COALESCE(
      v_user_metadata->>'display_name',
      v_user_metadata->>'full_name',
      v_user_metadata->>'name',
      split_part(v_user_email, '@', 1)
    );
    
    v_phone_number := COALESCE(
      v_user_metadata->>'phone_number',
      v_user_metadata->>'phone',
      v_user_email
    );
    
    -- Check if staff_members exists
    IF NOT EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = v_user_id) THEN
      INSERT INTO public.staff_members (
        user_id,
        display_name,
        phone_number,
        preferred_locations,
        preferred_roles,
        onboarding_status,
        marketplace_visible
      ) VALUES (
        v_user_id,
        v_display_name,
        v_phone_number,
        COALESCE(ARRAY[v_user_metadata->>'area'], ARRAY[]::TEXT[]),
        ARRAY['waiter', 'bartender'],
        'active',
        true
      );
      RAISE NOTICE 'Created staff_members record for user % (%)', v_user_id, v_display_name;
    ELSE
      -- Update existing record to active status
      UPDATE public.staff_members
      SET 
        display_name = v_display_name,
        phone_number = v_phone_number,
        preferred_locations = COALESCE(ARRAY[v_user_metadata->>'area'], ARRAY[]::TEXT[]),
        preferred_roles = COALESCE(preferred_roles, ARRAY['waiter', 'bartender']),
        onboarding_status = 'active',
        marketplace_visible = true
      WHERE user_id = v_user_id;
      RAISE NOTICE 'Updated staff_members record for user % to active and visible', v_user_id;
    END IF;
  END IF;
END $$;

-- Check and create staff_members for user 7ed6cc0b-2ff0-4a58-b00d-2704be240585
DO $$
DECLARE
  v_user_id UUID := '7ed6cc0b-2ff0-4a58-b00d-2704be240585';
  v_user_email TEXT;
  v_user_metadata JSONB;
  v_display_name TEXT;
  v_phone_number TEXT;
BEGIN
  -- Get user from auth.users
  SELECT email, raw_user_meta_data 
  INTO v_user_email, v_user_metadata
  FROM auth.users 
  WHERE id = v_user_id;
  
  IF v_user_email IS NULL THEN
    RAISE NOTICE 'User % not found in auth.users', v_user_id;
  ELSE
    -- Extract display name from metadata
    v_display_name := COALESCE(
      v_user_metadata->>'display_name',
      v_user_metadata->>'full_name',
      v_user_metadata->>'name',
      split_part(v_user_email, '@', 1)
    );
    
    v_phone_number := COALESCE(
      v_user_metadata->>'phone_number',
      v_user_metadata->>'phone',
      v_user_email
    );
    
    -- Check if staff_members exists
    IF NOT EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = v_user_id) THEN
      INSERT INTO public.staff_members (
        user_id,
        display_name,
        phone_number,
        preferred_locations,
        preferred_roles,
        onboarding_status,
        marketplace_visible
      ) VALUES (
        v_user_id,
        v_display_name,
        v_phone_number,
        COALESCE(ARRAY[v_user_metadata->>'area'], ARRAY[]::TEXT[]),
        ARRAY['waiter', 'bartender'],
        'active',
        true
      );
      RAISE NOTICE 'Created staff_members record for user % (%)', v_user_id, v_display_name;
    ELSE
      -- Update existing record to active status
      UPDATE public.staff_members
      SET 
        display_name = v_display_name,
        phone_number = v_phone_number,
        preferred_locations = COALESCE(ARRAY[v_user_metadata->>'area'], ARRAY[]::TEXT[]),
        preferred_roles = COALESCE(preferred_roles, ARRAY['waiter', 'bartender']),
        onboarding_status = 'active',
        marketplace_visible = true
      WHERE user_id = v_user_id;
      RAISE NOTICE 'Updated staff_members record for user % to active and visible', v_user_id;
    END IF;
  END IF;
END $$;

-- Verify the results
SELECT 
  sm.id,
  sm.user_id,
  sm.display_name,
  sm.phone_number,
  sm.onboarding_status,
  u.email
FROM public.staff_members sm
JOIN auth.users u ON u.id = sm.user_id
WHERE sm.user_id IN ('7952b427-293f-4698-9899-64648af051c6', '7ed6cc0b-2ff0-4a58-b00d-2704be240585');
