-- Fix cross-tenant audit log access (retry)
-- Previously: any admin could read audit logs from ANY facility
-- Now: admins can only read audit logs from their own facility

-- Ensure helper functions exist (idempotent)
CREATE OR REPLACE FUNCTION get_user_facility_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT facility_id FROM user_profiles
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Drop the existing overly-permissive policy
DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logs;

-- Create facility-scoped admin SELECT policy
CREATE POLICY audit_logs_select_admin
    ON audit_logs
    FOR SELECT
    USING (is_admin() AND facility_id = get_user_facility_id());
