-- Platform settings (key-value store for admin configuration)
CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow service role full access (no RLS needed for admin-only table)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON platform_settings FOR ALL USING (auth.role() = 'service_role');
