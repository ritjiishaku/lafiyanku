-- ============================================
-- Lafiyanku — Development Seed Data
-- IMPORTANT: Dev seed only. Never run in production.
-- Run with: supabase db reset
-- ============================================

-- ============================================
-- CLEAN EXISTING DATA (dev only)
-- ============================================

TRUNCATE audit_logs CASCADE;
TRUNCATE translation_requests CASCADE;
TRUNCATE discharge_records CASCADE;
TRUNCATE patient_inputs CASCADE;
TRUNCATE user_profiles CASCADE;
TRUNCATE facilities CASCADE;

-- ============================================
-- FACILITIES
-- ============================================

INSERT INTO facilities (facility_id, facility_code, facility_name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'LUTH-001', 'Lagos University Teaching Hospital'),
    ('22222222-2222-2222-2222-222222222222', 'ABUTH-001', 'Ahmadu Bello University Teaching Hospital'),
    ('33333333-3333-3333-3333-333333333333', 'UCH-001', 'University College Hospital Ibadan');

-- ============================================
-- AUTH USERS (Supabase Auth)
-- Default password for all seed users: Lafiyanku@2026
-- In local dev, passwords use Supabase's `crypt` for bcrypt.
-- Generate with: `supabase db reset && select crypt('Lafiyanku@2026', gen_salt('bf'));`
-- ============================================

-- Doctor: Ritji Ishaku
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'dr.ritji@lafiyanku.dev',
    '{"full_name": "Ritji Ishaku"}',
    crypt('Lafiyanku@2026', gen_salt('bf')),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Nurse: Ritji Ishaku
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, created_at, updated_at)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'nurse.ritji@lafiyanku.dev',
    '{"full_name": "Ritji Ishaku"}',
    crypt('Lafiyanku@2026', gen_salt('bf')),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Admin: Ritji Ishaku (Hospital Administrator)
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, created_at, updated_at)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'admin.ritji@lafiyanku.dev',
    '{"full_name": "Ritji Ishaku"}',
    crypt('Lafiyanku@2026', gen_salt('bf')),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USER PROFILES
-- ============================================

INSERT INTO user_profiles (user_id, email, full_name, role, facility_id) VALUES
    -- Doctor
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.ritji@lafiyanku.dev', 'Ritji Ishaku', 'doctor', '11111111-1111-1111-1111-111111111111'),
    -- Nurse
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'nurse.ritji@lafiyanku.dev', 'Ritji Ishaku', 'nurse', '11111111-1111-1111-1111-111111111111'),
    -- Admin
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin.ritji@lafiyanku.dev', 'Ritji Ishaku', 'admin', '11111111-1111-1111-1111-111111111111');

-- ============================================
-- PATIENT INPUTS (Nigerian clinical example)
-- Patient: Mrs. Ngozi Okonkwo
-- Diagnosis: Hypertension and Type 2 Diabetes Mellitus
-- ============================================

INSERT INTO patient_inputs (
    patient_id,
    facility_id,
    facility_name,
    facility_code,
    ward_name,
    patient_name,
    hospital_number,
    nhis_number,
    age,
    gender,
    admission_date,
    discharge_date,
    diagnosis,
    treatment_given,
    procedures_performed,
    medications,
    follow_up_instructions,
    additional_notes,
    language_requested,
    discharged_by,
    clinician_license_no
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'Lagos University Teaching Hospital',
    'LUTH-001',
    'Medical Ward A',
    'Mrs. Ngozi Okonkwo',
    'LUTH/2024/00412',
    'NHIS/123456789',
    54,
    'Female',
    '2026-05-25',
    '2026-06-02',
    'Hypertension and Type 2 Diabetes Mellitus',
    'Patient admitted with hypertensive urgency (BP 180/110) and blood glucose of 280 mg/dL. Administered IV fluids, insulin sliding scale for 48 hours, and initiated amlodipine 5mg daily. Blood pressure stabilised at 130/85. Blood glucose controlled at 110-140 mg/dL. Patient educated on lifestyle modifications.',
    ARRAY['Blood glucose monitoring QID', 'Blood pressure monitoring TID', 'Patient education on diabetes management'],
    '[
        {
            "name": "Amlodipine",
            "dosage": "5mg",
            "frequency": "once daily",
            "timing": "morning",
            "duration": "ongoing",
            "notes": "Take with food. Do not crush."
        },
        {
            "name": "Metformin",
            "dosage": "500mg",
            "frequency": "twice daily",
            "timing": "with meals",
            "duration": "ongoing",
            "notes": ""
        },
        {
            "name": "Lisinopril",
            "dosage": "10mg",
            "frequency": "once daily",
            "timing": "morning",
            "duration": "ongoing",
            "notes": "Monitor for dry cough"
        }
    ]'::jsonb,
    'Return to clinic in 2 weeks for blood pressure and blood glucose check. Bring blood glucose log. Follow up with endocrinology in 1 month.',
    'Patient is a teacher at local primary school. Lives with husband. Two children are supportive.',
    'yo',
    'Ritji Ishaku',
    'MDCN/2015/07821'
);

-- ============================================
-- DISCHARGE RECORDS
-- ============================================

INSERT INTO discharge_records (
    record_id,
    patient_input_id,
    facility_id,
    generated_at,
    generated_by_user_id,
    prompt_version,
    model_version,
    clinical_summary,
    patient_friendly_output,
    translated_output,
    translation_language,
    translation_confidence,
    missing_fields_log,
    flagged_issues,
    status,
    last_edited_at,
    last_edited_by_user_id
) VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    '2026-06-02 10:30:00+00',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'v2.0',
    'deepseek-chat',
    '──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────

Facility
Name:       Lagos University Teaching Hospital
FMOH Code:  LUTH-001
Ward:       Medical Ward A

Patient information
Name:              Mrs. Ngozi Okonkwo
Age:               54
Gender:            Female
Hospital No.:      LUTH/2024/00412
NHIS No.:          NHIS/123456789
Date of admission: 2026-05-25
Date of discharge: 2026-06-02

Diagnosis
Hypertension and Type 2 Diabetes Mellitus

Treatment provided
Patient admitted with hypertensive urgency (BP 180/110) and blood glucose of 280 mg/dL. Administered IV fluids, insulin sliding scale for 48 hours, and initiated amlodipine 5mg daily. Blood pressure stabilised at 130/85. Blood glucose controlled at 110-140 mg/dL. Patient educated on lifestyle modifications.

Procedures performed
- Blood glucose monitoring QID
- Blood pressure monitoring TID
- Patient education on diabetes management

Medications
| Medication | Dosage | Frequency | Timing | Duration | Notes |
|------------|--------|-----------|--------|----------|-------|
| Amlodipine | 5mg | once daily | morning | ongoing | Take with food. Do not crush. |
| Metformin | 500mg | twice daily | with meals | ongoing | |
| Lisinopril | 10mg | once daily | morning | ongoing | Monitor for dry cough |

Follow-up instructions
Return to clinic in 2 weeks for blood pressure and blood glucose check. Bring blood glucose log. Follow up with endocrinology in 1 month.

Red flag warnings
- Chest pain or pressure
- Severe headache
- Shortness of breath
- Blood glucose >300 mg/dL or <70 mg/dL
- Fainting or severe dizziness

Discharged by
Name:              Ritji Ishaku
MDCN Licence No.:  MDCN/2015/07821
──────────────────────────────────────────',
    '──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────

What happened
You have high blood pressure and diabetes. Your blood pressure was very high and your blood sugar was too high when you came in.

Treatment you received
We gave you fluids through a drip, helped control your blood sugar with insulin, and started you on medicines for blood pressure. Your blood pressure and blood sugar are now in a safer range.

Your medications
1. Amlodipine — 5mg, once daily in the morning, for a long time. Take with food. Do not crush the tablet.
2. Metformin — 500mg, twice daily with meals, for a long time.
3. Lisinopril — 10mg, once daily in the morning, for a long time. Tell your doctor if you develop a dry cough.

Important home care instructions
Monitor your blood pressure daily. Check your blood sugar before meals. Eat a balanced diet low in salt and sugar. Exercise for 30 minutes daily. Keep all your clinic appointments.

When to return to the hospital
- Chest pain or pressure
- Severe headache
- Trouble breathing
- Blood sugar over 300 or under 70
- Fainting or severe dizziness

Your follow-up appointment
Return to the clinic in 2 weeks to check your blood pressure and blood sugar. Bring your blood sugar log book. See the diabetes doctor in 1 month.

Signed by: Ritji Ishaku
Date: 02 June 2026',
    'AWỌN ILANA IṢUJU NILE RẸ

Kini o mu wa si ile-iwosan?
O ni ẹjẹ riru ati àtọgbẹ. Ẹjẹ riru rẹ ga pupọ ati pe suga ẹjẹ rẹ ga ju ti o yẹ nigbati o wa.

Ohun ti a ṣe fun ọ
A fun ọ ni omi nipasẹ idii, a ṣe iranlọwọ lati ṣakoso suga ẹjẹ rẹ pẹlu insulin, a si bẹrẹ oogun fun ẹjẹ riru rẹ. Ẹjẹ riru ati suga ẹjẹ rẹ ti wa ni ipele ailewu.

Oogun lati mu ni ile
1. Amlodipine — 5mg, lẹẹkan lojumọ ni owurọ, fun igba pipẹ. Mu pẹlu ounjẹ. Ma ṣe fọ tabulẹti naa.
2. Metformin — 500mg, lẹẹmeji lojumọ pẹlu ounjẹ, fun igba pipẹ.
3. Lisinopril — 10mg, lẹẹkan lojumọ ni owurọ, fun igba pipẹ. Sọ fun dokita rẹ ti o ba ni Ikọ gbigbẹ.

Igba ti o yẹ ki o pada si ile-iwosan
Pada si ile-iwosan ni ọsẹ meji lati ṣayẹwo ẹjẹ riru ati suga ẹjẹ rẹ. Mu iwe akosile suga ẹjẹ rẹ wa. Ri dokita àtọgbẹ ni oṣu kan.

AWỌN AMI EEWU — PADA SI ILE-IWOSAN LẸSẸKẸSẸ TI:
- Ìrora ọkan tabi titẹ ọkan
- Ori fifo pupọ
- Iṣoro mimi
- Suga ẹjẹ to ju 300 lọ tabi kere si 70
- Daku tabi riru pupọ

Signed by: Ritji Ishaku
Date: 02 June 2026',
    'yo',
    'high',
    ARRAY[]::text[],
    ARRAY[]::text[],
    'draft',
    NULL,
    NULL
);

-- ============================================
-- TRANSLATION REQUEST (Hausa)
-- ============================================

INSERT INTO translation_requests (
    request_id,
    record_id,
    source_text,
    target_language,
    output_text,
    confidence,
    fallback_used,
    requested_at,
    completed_at
) VALUES (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'PATIENT DISCHARGE INSTRUCTIONS

What happened
You have high blood pressure and diabetes...',
    'ha',
    'UMARNOMAR FITAR DA KA''AN KA

Me ya kawo ka asibiti?
Kana da hawan jini da ciwon sukari...',
    'high',
    false,
    '2026-06-02 10:31:00+00',
    '2026-06-02 10:31:05+00'
);

-- ============================================
-- AUDIT LOGS
-- ============================================

-- Generate action (AI generation)
INSERT INTO audit_logs (
    log_id,
    record_id,
    user_id,
    user_role,
    action,
    timestamp,
    ip_address,
    changes_diff,
    notes
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'doctor',
    'generate',
    '2026-06-02 10:30:00+00',
    '192.168.1.100',
    NULL,
    'AI generation completed successfully'
);

-- View action (doctor viewed record)
INSERT INTO audit_logs (
    log_id,
    record_id,
    user_id,
    user_role,
    action,
    timestamp,
    ip_address,
    changes_diff,
    notes
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'doctor',
    'view',
    '2026-06-02 10:32:00+00',
    '192.168.1.100',
    NULL,
    'Ritji Ishaku reviewed discharge output'
);

-- Edit action (doctor edited follow-up instructions)
INSERT INTO audit_logs (
    log_id,
    record_id,
    user_id,
    user_role,
    action,
    timestamp,
    ip_address,
    changes_diff,
    notes
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'doctor',
    'edit',
    '2026-06-02 10:33:00+00',
    '192.168.1.100',
    '{"follow_up_instructions": {"old": "Return to clinic in 2 weeks", "new": "Return to clinic in 1 week"}}'::jsonb,
    'Ritji Ishaku shortened follow-up interval'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count records by table
-- SELECT 'patient_inputs' as table_name, COUNT(*) FROM patient_inputs
-- UNION ALL SELECT 'discharge_records', COUNT(*) FROM discharge_records
-- UNION ALL SELECT 'translation_requests', COUNT(*) FROM translation_requests
-- UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
        -- UNION ALL SELECT 'user_profiles', COUNT(*) FROM user_profiles;

-- Expected counts: patient_inputs: 1, discharge_records: 1, translation_requests: 1, audit_logs: 3, user_proiles: 3

-- ============================================
-- SEED DATA SUMMARY
-- ============================================

/*
| Table              | Row Count | Purpose                          |
|--------------------|-----------|----------------------------------|
| facilities         | 3         | Hospital facilities              |
| user_profiles | 3         | Doctor, Nurse, Admin             |
| patient_inputs     | 1         | Mrs. Ngozi Okonkwo (LUTH)        |
| discharge_records  | 1         | Draft record with full outputs   |
| translation_requests| 1        | Hausa translation (high confidence)|
| audit_logs         | 3         | generate, view, edit actions     |
*/

-- ============================================
-- CONSTRAINTS FOR THIS FILE
-- ============================================

-- Never run this seed file in production (contains test data and fixed UUIDs)
-- Never commit real patient data to seed files
-- Never use these fixed UUIDs in production (Supabase generates random UUIDs)
-- Never forget to reset the database before running tests (`supabase db reset`)
-- Never hardcode passwords in seed files (Supabase Auth requires password setup separately)