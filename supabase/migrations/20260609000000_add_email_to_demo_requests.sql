-- ============================================
-- CareFlow — Add email column to demo_requests
-- Migration ID: 20260609_add_email_to_demo_requests
-- ============================================

ALTER TABLE demo_requests
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '';

COMMENT ON COLUMN demo_requests.email IS 'Contact email for the demo request';
