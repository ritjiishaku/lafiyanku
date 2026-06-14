-- ============================================
-- Lafiyanku — Ensure on_auth_user_created trigger is dropped
-- Migration ID: 20260614000001
-- Safety net: the trigger was supposed to be dropped in 20260615000000
-- but may still exist if migrations were partially applied.
-- The register APIs handle profile creation via upsert.
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
