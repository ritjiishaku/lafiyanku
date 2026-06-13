-- Drop the handle_new_user() trigger that hardcodes role='nurse' and facility_id=NULL.
-- The register APIs (/api/register, /api/facilities/register) handle profile creation
-- via upsert and are the sole source of truth for role and facility assignment.
--
-- Keeping the trigger active causes race conditions: it creates a profile before
-- the API runs, and if the API's upsert or cleanup fails, the user is stuck with
-- a profile with incorrect role ('nurse') and no facility_id.
--
-- This was originally introduced to ensure every auth.users row has a corresponding
-- user_profiles row. However, the register APIs now handle this explicitly, and the
-- trigger's hardcoded defaults have been a source of role-corruption bugs.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user;
