-- ============================================
-- RPC: create_discharge_record
-- Wraps patient_input, discharge_record,
-- translation_request, and audit_log inserts
-- in a single database transaction.
-- Throws on failure — all inserts roll back.
-- ============================================

CREATE OR REPLACE FUNCTION create_discharge_record(
  p_patient_id UUID,
  p_record_id UUID,
  p_facility_id UUID,
  p_facility_name TEXT,
  p_facility_code TEXT,
  p_ward_name TEXT,
  p_admission_date DATE,
  p_discharge_date DATE,
  p_patient_name TEXT,
  p_age INTEGER,
  p_gender TEXT,
  p_hospital_number TEXT,
  p_nhis_number TEXT,
  p_diagnosis TEXT,
  p_treatment_given TEXT,
  p_procedures_performed JSONB,
  p_medications JSONB,
  p_follow_up_instructions TEXT,
  p_additional_notes TEXT,
  p_language_requested TEXT,
  p_discharged_by TEXT,
  p_clinician_license_no TEXT,
  p_generated_by_user_id UUID,
  p_user_role TEXT,
  p_prompt_version TEXT,
  p_model_version TEXT,
  p_clinical_summary TEXT,
  p_patient_friendly_output TEXT,
  p_translated_output TEXT,
  p_translation_language TEXT,
  p_translation_confidence TEXT,
  p_missing_fields_log JSONB,
  p_flagged_issues JSONB,
  p_translation_request_id UUID,
  p_translation_source_text TEXT,
  p_translation_target_language TEXT,
  p_consent_given BOOLEAN,
  p_consent_timestamp TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_translation_confidence_enum confidence_enum;
BEGIN
  INSERT INTO patient_inputs (
    patient_id, facility_id, facility_name, facility_code,
    ward_name, admission_date, discharge_date, patient_name,
    age, gender, hospital_number, nhis_number, diagnosis,
    treatment_given, procedures_performed, medications,
    follow_up_instructions, additional_notes, language_requested,
    discharged_by, clinician_license_no, consent_given, consent_timestamp
  ) VALUES (
    p_patient_id, p_facility_id, p_facility_name, p_facility_code,
    p_ward_name, p_admission_date, p_discharge_date, p_patient_name,
    p_age, p_gender::gender_enum, p_hospital_number, p_nhis_number, p_diagnosis,
    p_treatment_given, ARRAY(SELECT jsonb_array_elements_text(p_procedures_performed)), p_medications,
    p_follow_up_instructions, p_additional_notes, p_language_requested::language_enum,
    p_discharged_by, p_clinician_license_no, COALESCE(p_consent_given, false), p_consent_timestamp
  );

  IF p_translation_confidence IS NOT NULL THEN
    v_translation_confidence_enum := p_translation_confidence::confidence_enum;
  END IF;

  INSERT INTO discharge_records (
    record_id, patient_input_id, facility_id, generated_at,
    generated_by_user_id, prompt_version, model_version,
    clinical_summary, patient_friendly_output,
    translated_output, translation_language, translation_confidence,
    missing_fields_log, flagged_issues, status
  ) VALUES (
    p_record_id, p_patient_id, p_facility_id, NOW(),
    p_generated_by_user_id, p_prompt_version, p_model_version,
    p_clinical_summary, p_patient_friendly_output,
    p_translated_output, p_translation_language::language_enum, v_translation_confidence_enum,
    ARRAY(SELECT jsonb_array_elements_text(p_missing_fields_log)),
    ARRAY(SELECT jsonb_array_elements_text(p_flagged_issues)), 'draft'
  );

  IF p_translation_target_language IS NOT NULL AND p_translation_target_language != 'en' AND p_translation_confidence != 'failed' THEN
    INSERT INTO translation_requests (
      request_id, record_id, source_text, target_language,
      output_text, confidence, fallback_used,
      requested_at, completed_at
    ) VALUES (
      p_translation_request_id, p_record_id, p_translation_source_text,
      p_translation_target_language::language_enum, p_translated_output,
      v_translation_confidence_enum,
      CASE WHEN p_translation_confidence = 'low' THEN TRUE ELSE FALSE END,
      NOW(), NOW()
    );
  END IF;

  INSERT INTO audit_logs (
    record_id, user_id, user_role, action, timestamp, facility_id
  ) VALUES (
    p_record_id, p_generated_by_user_id, p_user_role::user_role_enum, 'generate'::audit_action_enum, NOW(), p_facility_id
  );

  RETURN p_record_id;
END;
$$;
