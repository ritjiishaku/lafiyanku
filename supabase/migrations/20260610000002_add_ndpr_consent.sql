-- ============================================
-- CareFlow — Add NDPR consent columns
-- Migration ID: 20260610000002
-- Adds: consent_given, consent_timestamp to patient_inputs
-- ============================================

-- Add consent tracking columns (nullable for existing records)
ALTER TABLE patient_inputs ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE patient_inputs ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;
