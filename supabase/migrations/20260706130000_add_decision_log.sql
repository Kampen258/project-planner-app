-- Migration: Add Decision Log persistence (New Agile methodology, Sprint 3)
-- Models the manual's Decision Log template: context, options considered,
-- rationale, evidence links, and a review date.
--
-- SECURITY NOTE: same dev-mode posture as add_discovery_system.sql — the app
-- runs with mock auth, so RLS is permissive and created_by has no FK.
-- TODO(auth-sprint): replace dev_allow_all_decisions with auth.uid()-scoped
-- policies and add the FK to auth.users.

CREATE TABLE IF NOT EXISTS decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT,
  options_considered JSONB DEFAULT '[]',
  decision TEXT,
  rationale TEXT,
  evidence JSONB DEFAULT '[]',
  owner TEXT,
  stakeholders JSONB DEFAULT '[]',
  success_criteria JSONB DEFAULT '[]',
  review_date DATE,
  outcome TEXT,
  lessons_learned TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_review_date ON decisions(review_date);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dev_allow_all_decisions ON decisions;
CREATE POLICY dev_allow_all_decisions ON decisions FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE decisions IS 'Decision log: key choices with context, options, rationale, evidence, and review dates';
