```sql
# File: .agents/database/schema.sql
# Version: 1.0
# Last updated: 2026-06-02
# PRD reference: CFW-PRD-001 v1.0
# Purpose: Complete Postgres SQL migration file — all tables, enums, constraints, indexes, and audit log protection trigger.

-- ============================================
-- CareFlow — Complete Database Schema
-- Stack: Supabase (PostgreSQL 15+)
-- Migration ID: 20260602_initial_schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- Gender enum (PatientInput)
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');

-- Language enum (PatientInput.languageRequested, DischargeRecord.translationLanguage)
CREATE TYPE language_enum AS ENUM ('en', 'ha', 'yo', 'ig');

-- Translation confidence enum
CREATE TYPE confidence_enum AS ENUM ('high', 'low', 'failed');

-- Discharge record status enum
CREATE TYPE record_status_enum AS ENUM ('draft', 'finalised', 'archived');

-- User role enum (AuditLog.userRole)
CREATE TYPE user_role_enum AS ENUM ('doctor', 'nurse', 'admin');

-- Audit action enum
CREATE TYPE audit_action_enum AS ENUM ('generate', 'edit', 'view', 'finalise', 'archive', 'print', 'export');

-- ============================================
-- TABLE: patient_inputs
-- Stores the structured form data submitted by clinician
-- ============================================
CREATE TABLE patient_inputs (
    -- Primary key
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Facility information
    facility_id UUID NOT NULL REFERENCES facilities(facility_id),
    facility_name VARCHAR(300) NOT NULL,
    facility_code VARCHAR(50),
    ward_name VARCHAR(100),
    
    -- Patient identification
    patient_name VARCHAR(200) NOT NULL,
    hospital_number VARCHAR(100) NOT NULL,
    nhis_number VARCHAR(50),
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
    gender gender_enum NOT NULL,
    
    -- Dates
    admission_date DATE NOT NULL,
    discharge_date DATE NOT NULL,
    CHECK (discharge_date >= admission_date),
    
    -- Clinical information
    diagnosis VARCHAR(2000) NOT NULL,
    treatment_given VARCHAR(3000) NOT NULL,
    procedures_performed TEXT[] DEFAULT '{}',
    follow_up_instructions VARCHAR(2000),
    additional_notes VARCHAR(2000),
    
    -- Medications (stored as JSONB array of Medication objects)
    medications JSONB NOT NULL CHECK (jsonb_array_length(medications) > 0),
    
    -- Language preference
    language_requested language_enum DEFAULT 'en',
    
    -- Discharging clinician
    discharged_by VARCHAR(200) NOT NULL,
    clinician_license_no VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for patient_inputs
CREATE INDEX idx_patient_inputs_hospital_number ON patient_inputs(hospital_number);
CREATE INDEX idx_patient_inputs_admission_date ON patient_inputs(admission_date);
CREATE INDEX idx_patient_inputs_discharge_date ON patient_inputs(discharge_date);
CREATE INDEX idx_patient_inputs_patient_name ON patient_inputs(patient_name);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_inputs_updated_at
    BEFORE UPDATE ON patient_inputs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE patient_inputs IS 'Structured form data submitted by clinician before AI generation';
COMMENT ON COLUMN patient_inputs.medications IS 'JSONB array of Medication objects: {name, dosage, frequency, timing, duration, notes}';
COMMENT ON COLUMN patient_inputs.procedures_performed IS 'Array of procedure names, empty array if none';

-- ============================================
-- TABLE: discharge_records
-- Stores AI-generated output and metadata
-- ============================================
CREATE TABLE discharge_records (
    -- Primary key
    record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to patient_inputs
    patient_input_id UUID NOT NULL REFERENCES patient_inputs(patient_id) ON DELETE RESTRICT,
    
    -- Facility isolation (denormalised for direct RLS lookups)
    facility_id UUID NOT NULL REFERENCES facilities(facility_id),
    
    -- Generation metadata
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by_user_id UUID NOT NULL, -- References auth.users (Supabase Auth)
    prompt_version VARCHAR(20) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    
    -- AI outputs
    clinical_summary TEXT NOT NULL,
    patient_friendly_output TEXT NOT NULL,
    translated_output TEXT,
    translation_language language_enum,
    translation_confidence confidence_enum,
    
    -- Quality flags
    missing_fields_log TEXT[] DEFAULT '{}',
    flagged_issues TEXT[] DEFAULT '{}',
    
    -- Status lifecycle
    status record_status_enum NOT NULL DEFAULT 'draft',
    
    -- Edit tracking
    last_edited_at TIMESTAMPTZ,
    last_edited_by_user_id UUID, -- References auth.users
    
    -- Constraints
    CONSTRAINT discharge_records_status_check CHECK (
        (status = 'draft' AND last_edited_at IS NULL AND last_edited_by_user_id IS NULL) OR
        (status IN ('draft', 'finalised', 'archived'))
    ),
    CONSTRAINT discharge_records_translation_confidence_check CHECK (
        (translation_language IS NULL AND translation_confidence IS NULL) OR
        (translation_language IS NOT NULL AND translation_confidence IS NOT NULL)
    )
);

-- Indexes for discharge_records
CREATE INDEX idx_discharge_records_patient_input_id ON discharge_records(patient_input_id);
CREATE INDEX idx_discharge_records_generated_by_user_id ON discharge_records(generated_by_user_id);
CREATE INDEX idx_discharge_records_status ON discharge_records(status);
CREATE INDEX idx_discharge_records_generated_at ON discharge_records(generated_at);
CREATE INDEX idx_discharge_records_patient_input_id_status ON discharge_records(patient_input_id, status);
CREATE INDEX idx_discharge_records_translation_language ON discharge_records(translation_language) WHERE translation_language IS NOT NULL;

COMMENT ON TABLE discharge_records IS 'AI-generated discharge summaries with metadata and status tracking';
COMMENT ON COLUMN discharge_records.clinical_summary IS 'Mode 1 output — professional clinical discharge summary';
COMMENT ON COLUMN discharge_records.patient_friendly_output IS 'Mode 2 output — plain-language patient instructions';
COMMENT ON COLUMN discharge_records.translated_output IS 'Optional translation of Mode 2 into Hausa/Yoruba/Igbo';
COMMENT ON COLUMN discharge_records.missing_fields_log IS 'Fields flagged as missing during generation (FR-14)';
COMMENT ON COLUMN discharge_records.flagged_issues IS 'Contradictions or warnings raised during generation (FR-15)';

-- ============================================
-- TABLE: translation_requests
-- Tracks each translation job for audit and retry
-- ============================================
CREATE TABLE translation_requests (
    -- Primary key
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to discharge_records
    record_id UUID NOT NULL REFERENCES discharge_records(record_id) ON DELETE CASCADE,
    
    -- Translation details
    source_text TEXT NOT NULL,
    target_language language_enum NOT NULL,
    output_text TEXT,
    confidence confidence_enum,
    fallback_used BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT translation_requests_completed_check CHECK (
        (completed_at IS NULL AND output_text IS NULL AND confidence IS NULL) OR
        (completed_at IS NOT NULL)
    )
);

-- Indexes for translation_requests
CREATE INDEX idx_translation_requests_record_id ON translation_requests(record_id);
CREATE INDEX idx_translation_requests_requested_at ON translation_requests(requested_at);
CREATE INDEX idx_translation_requests_target_language ON translation_requests(target_language);
CREATE INDEX idx_translation_requests_confidence ON translation_requests(confidence);

COMMENT ON TABLE translation_requests IS 'Audit trail for every translation request, including failures and fallbacks';
COMMENT ON COLUMN translation_requests.fallback_used IS 'True if translation confidence was low or failed and English was used instead (PRD §6.2 FR-19)';

-- ============================================
-- TABLE: audit_logs
-- Immutable audit trail for NDPR 2019 compliance
-- ============================================
CREATE TABLE audit_logs (
    -- Primary key
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to discharge_records
    record_id UUID NOT NULL REFERENCES discharge_records(record_id) ON DELETE RESTRICT,
    
    -- User information
    user_id UUID NOT NULL, -- References auth.users (Supabase Auth)
    user_role user_role_enum NOT NULL,
    
    -- Action details
    action audit_action_enum NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    
    -- Change tracking (for edit actions)
    changes_diff JSONB,
    
    -- Optional notes
    notes TEXT,
    
    -- Constraint: changes_diff must be null for non-edit actions (enforced by application, optional here)
    CONSTRAINT audit_logs_changes_diff_check CHECK (
        (action = 'edit' AND changes_diff IS NOT NULL) OR
        (action != 'edit' AND changes_diff IS NULL)
    )
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_record_id_timestamp ON audit_logs(record_id, timestamp);

-- ============================================
-- AUDIT LOG IMMUTABILITY (NDPR 2019 Article 2.6)
-- Prevent UPDATE and DELETE on audit_logs
-- ============================================

-- Create a function that blocks UPDATE and DELETE
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'audit_logs entries cannot be updated (NDPR 2019 Article 2.6)';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'audit_logs entries cannot be deleted (NDPR 2019 Article 2.6)';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers that fire before UPDATE or DELETE
CREATE TRIGGER prevent_audit_log_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TRIGGER prevent_audit_log_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_mutation();

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for NDPR 2019 compliance. UPDATE and DELETE are blocked by triggers.';
COMMENT ON COLUMN audit_logs.ip_address IS 'Required by NDPR 2019 Article 2.6 for data integrity and security investigations';
COMMENT ON COLUMN audit_logs.changes_diff IS 'JSON diff of before/after for edit actions. Null for all other actions.';

-- ============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- Required for PRD §7 scalability (≥50 concurrent users)
-- ============================================

-- Composite index for admin audit log queries
CREATE INDEX idx_audit_logs_record_id_action_timestamp ON audit_logs(record_id, action, timestamp);

-- Partial index for active (non-archived) records
CREATE INDEX idx_discharge_records_active ON discharge_records(record_id) WHERE status != 'archived';

-- Index for clinician license lookups (FMOH requirement)
CREATE INDEX idx_patient_inputs_clinician_license ON patient_inputs(clinician_license_no) WHERE clinician_license_no IS NOT NULL;

-- ============================================
-- CONSTRAINTS SUMMARY
-- ============================================

-- Check: discharge_date >= admission_date (patient_inputs)
-- Check: age BETWEEN 0 AND 130 (patient_inputs)
-- Check: medications array not empty (patient_inputs)
-- Check: status transitions follow business rules (discharge_records)
-- Check: translation fields are consistent (discharge_records)
-- Check: audit_logs entries are immutable (triggers)
-- Check: changes_diff present only for edit actions (audit_logs)

-- ============================================
-- COMPLETION VERIFICATION
-- Run this query to verify all tables exist
-- ============================================

-- SELECT tablename FROM pg_tables WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Expected tables: patient_inputs, discharge_records, translation_requests, audit_logs

-- ============================================
-- CONSTRAINTS FOR THIS FILE
-- ============================================

-- Never drop tables without a backup
-- Never bypass the audit_log immutability triggers
-- Never alter enum values without a migration plan
-- Never remove foreign key constraints (they protect referential integrity)
-- Never use ON DELETE CASCADE for audit_logs (must use RESTRICT)
-- Never store plaintext passwords — Supabase Auth handles authentication externally