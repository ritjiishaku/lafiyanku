-- ============================================
-- CareFlow — Fix patient_inputs UPDATE RLS policy
-- Migration ID: 20260610000001
-- Adds facility_id check to prevent cross-facility data modification
-- ============================================

-- Drop the existing policy that lacks facility isolation
DROP POLICY IF EXISTS patient_inputs_update_clinical ON patient_inputs;

-- Recreate with facility_id check
CREATE POLICY patient_inputs_update_clinical
    ON patient_inputs
    FOR UPDATE
    USING ((is_doctor() OR is_nurse()) AND facility_id = get_user_facility_id())
    WITH CHECK ((is_doctor() OR is_nurse()) AND facility_id = get_user_facility_id());
