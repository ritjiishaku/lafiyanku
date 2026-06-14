-- ============================================
-- Lafiyanku — Create form_drafts table for FR-07
-- Migration ID: 20260617000000
-- Enables server-side save-as-draft persistence
-- ============================================

CREATE TABLE form_drafts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_input JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE form_drafts IS 'Saved form drafts per user (FR-07). One draft per user, upserted on save.';
COMMENT ON COLUMN form_drafts.patient_input IS 'Partial or complete PatientInput form data as JSONB';

CREATE OR REPLACE FUNCTION update_form_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    return NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_drafts_updated_at
    BEFORE UPDATE ON form_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_form_drafts_updated_at();

ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own draft
CREATE POLICY form_drafts_select_own
    ON form_drafts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert/update their own draft
CREATE POLICY form_drafts_upsert_own
    ON form_drafts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY form_drafts_update_own
    ON form_drafts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own draft
CREATE POLICY form_drafts_delete_own
    ON form_drafts
    FOR DELETE
    USING (auth.uid() = user_id);
