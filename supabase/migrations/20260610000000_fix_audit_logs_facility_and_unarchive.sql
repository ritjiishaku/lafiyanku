-- ============================================
-- CareFlow — Fix audit_logs schema gaps
-- Migration ID: 20260610000000
-- Adds: facility_id column, unarchive enum value
-- ============================================

-- Add facility_id to audit_logs for multi-tenant isolation
-- Nullable: existing rows get NULL, new rows will have facility_id set
ALTER TABLE audit_logs ADD COLUMN facility_id UUID REFERENCES facilities(facility_id);
CREATE INDEX idx_audit_logs_facility_id ON audit_logs(facility_id);

-- Add unarchive to audit_action_enum (safe enum extension)
DO $$ BEGIN
  ALTER TYPE audit_action_enum ADD VALUE 'unarchive';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
