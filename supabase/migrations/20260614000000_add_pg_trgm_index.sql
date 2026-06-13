-- Enable pg_trgm extension for efficient fuzzy search on patient names
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index for ilike '%term%' queries on patient_inputs.patient_name
-- Standard B-tree indexes cannot accelerate leading-wildcard patterns
DROP INDEX IF EXISTS idx_patient_inputs_patient_name_trgm;
CREATE INDEX idx_patient_inputs_patient_name_trgm
  ON patient_inputs
  USING gin (patient_name gin_trgm_ops);
