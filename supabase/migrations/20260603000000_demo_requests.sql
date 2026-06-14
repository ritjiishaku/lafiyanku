-- ============================================
-- Lafiyanku — Demo Requests Table
-- Captures marketing demo requests from the public site
-- Migration ID: 20260603_demo_requests
-- ============================================

CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(100) NOT NULL,
    facility_name VARCHAR(300) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    state VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow anonymous inserts (public marketing form)
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert demo requests"
    ON demo_requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Only authenticated users with admin role can view
CREATE POLICY "Only admins can view demo requests"
    ON demo_requests
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');
