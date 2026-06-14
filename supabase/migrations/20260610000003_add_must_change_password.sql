-- ============================================
-- Lafiyanku — Add must_change_password flag
-- Migration ID: 20260610000003
-- Adds: must_change_password to user_profiles
-- ============================================

-- Add flag to force password change on first login
-- Default false: existing users are not affected
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
