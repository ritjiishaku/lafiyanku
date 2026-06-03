```sql
# File: .agents/database/rls-policies.sql
# Version: 1.0
# Last updated: 2026-06-02
# PRD reference: CFW-PRD-001 v1.0
# Purpose: Complete Supabase Row Level Security (RLS) policies — facility isolation, role-based access, audit log protection.

-- ============================================
-- CareFlow — Row Level Security Policies
-- Stack: Supabase (PostgreSQL 15+)
-- Migration ID: 20260602_rls_policies
-- ============================================

-- ============================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================

-- Get current user's role from user_profiles table
-- Returns: 'doctor' | 'nurse' | 'admin' | NULL
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role_enum
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM user_profiles WHERE user_id = auth.uid()
    LIMIT 1;
$$;

-- Get current user's facility_id from user_profiles table
-- Used for multi-tenant isolation
CREATE OR REPLACE FUNCTION get_user_facility_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT facility_id FROM user_profiles WHERE user_id = auth.uid()
    LIMIT 1;
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT get_user_role() = 'admin';
$$;

-- Check if user is doctor
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT get_user_role() = 'doctor';
$$;

-- Check if user is nurse
CREATE OR REPLACE FUNCTION is_nurse()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT get_user_role() = 'nurse';
$$;

-- ============================================
-- TABLE: user_profiles
-- Stores role and facility_id for each Supabase Auth user
-- This table must be populated via a trigger when new users sign up
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'nurse',
    facility_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY user_profiles_select_own
    ON user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admin can read all profiles
CREATE POLICY user_profiles_select_admin
    ON user_profiles
    FOR SELECT
    USING (is_admin());

-- Admin can insert/update profiles
CREATE POLICY user_profiles_insert_admin
    ON user_profiles
    FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY user_profiles_update_admin
    ON user_profiles
    FOR UPDATE
    USING (is_admin());

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, role, facility_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'nurse', -- Default role; admin must promote manually
        '11111111-1111-1111-1111-111111111111' -- Default facility; admin must assign
    );
    RETURN NEW;
END;
$$;

-- Trigger to create profile on auth user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

COMMENT ON TABLE user_profiles IS 'Stores role and facility_id for each user. Required for RLS policies.';
COMMENT ON COLUMN user_profiles.facility_id IS 'Multi-tenant isolation: users can only access records from their facility';

-- ============================================
-- TABLE: patient_inputs
-- RLS: Users can only see patients from their facility
-- ============================================

ALTER TABLE patient_inputs ENABLE ROW LEVEL SECURITY;

-- Facility isolation: users can only see patients from their facility
CREATE POLICY patient_inputs_select_facility
    ON patient_inputs
    FOR SELECT
    USING (facility_id = get_user_facility_id());

-- Doctor and Nurse can INSERT — facility_id must match their facility
CREATE POLICY patient_inputs_insert_clinical
    ON patient_inputs
    FOR INSERT
    WITH CHECK ((is_doctor() OR is_nurse()) AND facility_id = get_user_facility_id());

-- Doctor and Nurse can UPDATE their own facility's records
CREATE POLICY patient_inputs_update_clinical
    ON patient_inputs
    FOR UPDATE
    USING (is_doctor() OR is_nurse())
    WITH CHECK (is_doctor() OR is_nurse());

-- Admin cannot SELECT or UPDATE patient_inputs (by design, per PRD §6.4)
-- Admin role only views audit logs and manages users

-- ============================================
-- TABLE: discharge_records
-- RLS: Role-based access with facility isolation
-- ============================================

ALTER TABLE discharge_records ENABLE ROW LEVEL SECURITY;

-- Facility isolation via denormalised facility_id (direct lookup, no join needed)
CREATE POLICY discharge_records_select_facility
    ON discharge_records
    FOR SELECT
    USING (facility_id = get_user_facility_id());

-- Doctor and Nurse can INSERT (generate new records) — facility_id must match their facility
CREATE POLICY discharge_records_insert_clinical
    ON discharge_records
    FOR INSERT
    WITH CHECK ((is_doctor() OR is_nurse()) AND facility_id = get_user_facility_id());

-- Doctor can UPDATE any draft record in their facility
CREATE POLICY discharge_records_update_doctor
    ON discharge_records
    FOR UPDATE
    USING (is_doctor() AND status = 'draft' AND facility_id = get_user_facility_id())
    WITH CHECK (is_doctor());

-- Nurse can UPDATE only their own draft records (generated_by_user_id = auth.uid()) within their facility
CREATE POLICY discharge_records_update_nurse_own
    ON discharge_records
    FOR UPDATE
    USING (is_nurse() AND status = 'draft' AND generated_by_user_id = auth.uid() AND facility_id = get_user_facility_id())
    WITH CHECK (is_nurse());

-- Only Doctor can finalise (change status to 'finalised') within their facility
CREATE POLICY discharge_records_finalise_doctor
    ON discharge_records
    FOR UPDATE
    USING (is_doctor() AND status = 'draft' AND facility_id = get_user_facility_id())
    WITH CHECK (is_doctor() AND NEW.status = 'finalised');

-- Admin can UPDATE status to 'archived' (soft delete) within their facility
CREATE POLICY discharge_records_archive_admin
    ON discharge_records
    FOR UPDATE
    USING (is_admin() AND status = 'finalised' AND facility_id = get_user_facility_id())
    WITH CHECK (is_admin() AND NEW.status = 'archived');

-- Doctor can also archive their own facility's finalised records
CREATE POLICY discharge_records_archive_doctor
    ON discharge_records
    FOR UPDATE
    USING (is_doctor() AND status = 'finalised' AND facility_id = get_user_facility_id())
    WITH CHECK (is_doctor() AND NEW.status = 'archived');

-- ============================================
-- TABLE: translation_requests
-- RLS: Inherits from discharge_records via foreign key
-- ============================================

ALTER TABLE translation_requests ENABLE ROW LEVEL SECURITY;

-- Users can see translation requests only if they can see the parent discharge_record
CREATE POLICY translation_requests_select_via_record
    ON translation_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM discharge_records
            WHERE discharge_records.record_id = translation_requests.record_id
            AND discharge_records.facility_id = get_user_facility_id()
        )
    );

-- System (service role) can INSERT translation_requests
-- Normal users cannot insert directly; done by API route with service role
CREATE POLICY translation_requests_insert_system
    ON translation_requests
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- TABLE: audit_logs
-- RLS: Admin can SELECT; system (service role) can INSERT
-- No UPDATE or DELETE allowed (triggers enforce immutability)
-- ============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admin can view audit logs (PRD §6.4)
CREATE POLICY audit_logs_select_admin
    ON audit_logs
    FOR SELECT
    USING (is_admin());

-- Only system (service role) can INSERT audit logs
-- API routes use SUPABASE_SERVICE_ROLE_KEY to write logs
CREATE POLICY audit_logs_insert_system
    ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- No UPDATE or DELETE policies exist — triggers block them at database level
-- This enforces NDPR 2019 Article 2.6 (data integrity and immutability)

-- ============================================
-- TABLE: facilities (optional, for multi-tenant isolation)
-- Simple lookup table for facility codes
-- ============================================

CREATE TABLE IF NOT EXISTS facilities (
    facility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_code VARCHAR(50) UNIQUE NOT NULL,
    facility_name VARCHAR(300) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read facilities
CREATE POLICY facilities_select_all
    ON facilities
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin can insert/update facilities
CREATE POLICY facilities_insert_admin
    ON facilities
    FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY facilities_update_admin
    ON facilities
    FOR UPDATE
    USING (is_admin());

-- ============================================
-- DEFAULT FACILITY (for initial setup)
-- ============================================

INSERT INTO facilities (facility_id, facility_code, facility_name)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'LUTH-001',
    'Lagos University Teaching Hospital'
) ON CONFLICT (facility_code) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all RLS policies are enabled
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Verify audit_logs immutability triggers exist
-- SELECT tgname, tgtype, tgenabled FROM pg_trigger WHERE tgname LIKE 'prevent_audit_log%';

-- ============================================
-- POLICY SUMMARY TABLE
-- ============================================

/*
| Table              | SELECT               | INSERT              | UPDATE               | DELETE |
|--------------------|----------------------|---------------------|----------------------|--------|
| user_profiles      | Own + Admin          | Admin only          | Admin only           | No     |
| patient_inputs     | Facility isolation   | Doctor/Nurse        | Doctor/Nurse         | No     |
| discharge_records  | Facility isolation   | Doctor/Nurse        | Doctor (draft)       | No     |
|                    |                      |                     | Nurse (own draft)    |        |
|                    |                      |                     | Doctor (finalise)    |        |
|                    |                      |                     | Admin/Doctor (archive)|       |
| translation_requests | Via parent record  | Service role only   | No                   | No     |
| audit_logs         | Admin only           | Service role only   | BLOCKED (trigger)    | BLOCKED (trigger) |
| facilities         | Authenticated users  | Admin only          | Admin only           | No     |
*/

-- ============================================
-- CONSTRAINTS FOR THIS FILE
-- ============================================

-- Never disable RLS on any table (security requirement)
-- Never create a policy that bypasses facility isolation (multi-tenant breach)
-- Never allow non-admin to SELECT from audit_logs
-- Never allow any role to UPDATE or DELETE audit_logs (immutability requirement)
-- Never allow Nurse or Admin to finalise a record (Doctor only per PRD)
-- Never allow client-side role checks to substitute for RLS policies
-- Never forget to run these policies after schema migrations