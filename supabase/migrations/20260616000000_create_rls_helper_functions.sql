-- ============================================
-- Lafiyanku — RLS helper functions
-- Migration ID: 20260616000000
-- Creates helper functions used by RLS policies
-- to check user role and facility_id.
-- ============================================

-- Returns true if the current user has role 'doctor'
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'doctor'
  );
$$;

-- Returns true if the current user has role 'nurse'
CREATE OR REPLACE FUNCTION is_nurse()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'nurse'
  );
$$;

-- Returns the facility_id of the current user
CREATE OR REPLACE FUNCTION get_user_facility_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT facility_id FROM user_profiles
  WHERE user_id = auth.uid();
$$;
