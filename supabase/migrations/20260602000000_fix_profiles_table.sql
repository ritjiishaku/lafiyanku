-- ============================================
-- Lafiyanku — Fix profiles table name and schema
-- Renames `profiles` → `user_profiles`
-- Changes primary key column `id` → `user_id`
-- Migration ID: 20260603_fix_profiles_table
-- ============================================

-- Rename the table (CASCADE handles dependent objects like triggers)
ALTER TABLE IF EXISTS profiles RENAME TO user_profiles;

-- Rename the primary key column
ALTER TABLE user_profiles RENAME COLUMN id TO user_id;

-- Drop the old trigger referencing the old table name
DROP TRIGGER IF EXISTS update_profiles_updated_at ON user_profiles;
