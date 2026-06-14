-- ============================================
-- Lafiyanku — Rate Limiting Table
-- Migration ID: 20260613000000_create_rate_limits
-- Supports auth.ts login rate limiting (5 attempts / 10 min window)
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL DEFAULT 'login',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup during rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action
    ON rate_limits(identifier, action_type, created_at);

-- Auto-cleanup: drop entries older than 1 hour (prevents unbounded growth)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM rate_limits
    WHERE created_at < NOW() - INTERVAL '1 hour';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trigger_cleanup_rate_limits'
    ) THEN
        CREATE TRIGGER trigger_cleanup_rate_limits
            AFTER INSERT ON rate_limits
            FOR EACH ROW
            EXECUTE FUNCTION cleanup_rate_limits();
    END IF;
END $$;
