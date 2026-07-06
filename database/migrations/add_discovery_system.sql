-- Migration: Add Discovery Track persistence (New Agile methodology)
-- Creates the tables behind the discovery loop (Opportunities → Hypotheses →
-- Experiments → Insights) plus delivery_tasks, which newAgileService already
-- references. See docs/USER_MANUAL.md for the methodology these model.
--
-- SECURITY NOTE: RLS policies here are permissive dev-mode policies because the
-- app currently runs with mock auth (no Supabase session, so auth.uid() is NULL
-- and user-scoped policies would reject every request). created_by columns are
-- plain UUIDs (no FK to auth.users) for the same reason.
-- TODO(auth-sprint): replace dev_allow_all_* policies with auth.uid()-scoped
-- policies and add FKs to auth.users once real Supabase auth is enabled.

-- Opportunities: problems worth solving (discovery pipeline stage 1)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT,
  affected_users TEXT,
  current_state TEXT,
  desired_outcome TEXT,
  success_metrics TEXT,
  evidence TEXT,
  assumptions TEXT,
  confidence INTEGER CHECK (confidence BETWEEN 1 AND 10),
  effort VARCHAR(1) CHECK (effort IN ('S', 'M', 'L')),
  risk VARCHAR(10) CHECK (risk IN ('low', 'medium', 'high')),
  cost_of_delay VARCHAR(10) CHECK (cost_of_delay IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'backlog' CHECK (status IN ('backlog', 'researching', 'validated', 'archived')),
  objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hypotheses: potential solutions to opportunities (stage 2)
CREATE TABLE IF NOT EXISTS hypotheses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  hypothesis_statement TEXT,
  assumptions JSONB DEFAULT '[]',
  test_method TEXT,
  success_criteria TEXT,
  scale_threshold TEXT,
  iterate_threshold TEXT,
  kill_threshold TEXT,
  resources_needed JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_test', 'learning', 'scaled', 'killed', 'archived')),
  experiment_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiments: small tests that validate or refute hypotheses (stage 3)
CREATE TABLE IF NOT EXISTS experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  hypothesis_id UUID REFERENCES hypotheses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  participants INTEGER DEFAULT 0,
  method VARCHAR(20) CHECK (method IN ('ab_test', 'prototype', 'concierge', 'interview', 'analytics', 'survey')),
  success_metrics JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'completed', 'cancelled')),
  results TEXT DEFAULT '',
  decision VARCHAR(10) DEFAULT 'pending' CHECK (decision IN ('scale', 'iterate', 'kill', 'pending')),
  next_steps TEXT DEFAULT '',
  insights JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights: learnings captured from discovery activities (stage 4)
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(20) CHECK (category IN ('interviews', 'usability_tests', 'analytics', 'surveys', 'other')),
  source TEXT,
  evidence JSONB DEFAULT '[]',
  impact_level VARCHAR(10) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
  actionable BOOLEAN DEFAULT true,
  tags JSONB DEFAULT '[]',
  linked_opportunities JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery tasks: validated work flowing through the delivery track
-- Columns mirror the DeliveryTask interface in src/types/newAgile.ts, because
-- newAgileService spreads create-request objects straight into inserts.
CREATE TABLE IF NOT EXISTS delivery_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'ready' CHECK (status IN ('ready', 'in_progress', 'review', 'released', 'measuring')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  effort VARCHAR(1) CHECK (effort IN ('S', 'M', 'L')),
  assignee TEXT,
  phase_id UUID,
  experiment_reference TEXT,
  hypothesis_reference TEXT,
  acceptance_criteria JSONB DEFAULT '[]',
  definition_of_ready JSONB DEFAULT '[]',
  definition_of_done JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cycle_time NUMERIC,
  blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  tags JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for the common lookup paths (by project, and by parent entity)
CREATE INDEX IF NOT EXISTS idx_opportunities_project ON opportunities(project_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_objective ON opportunities(objective_id);
CREATE INDEX IF NOT EXISTS idx_hypotheses_project ON hypotheses(project_id);
CREATE INDEX IF NOT EXISTS idx_hypotheses_opportunity ON hypotheses(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_experiments_project ON experiments(project_id);
CREATE INDEX IF NOT EXISTS idx_experiments_hypothesis ON experiments(hypothesis_id);
CREATE INDEX IF NOT EXISTS idx_insights_project ON insights(project_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_project ON delivery_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_status ON delivery_tasks(status);

-- Row Level Security: enabled with permissive dev-mode policies (see header)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tasks ENABLE ROW LEVEL SECURITY;

-- TODO(auth-sprint): replace with auth.uid()-scoped policies
DROP POLICY IF EXISTS dev_allow_all_opportunities ON opportunities;
CREATE POLICY dev_allow_all_opportunities ON opportunities FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS dev_allow_all_hypotheses ON hypotheses;
CREATE POLICY dev_allow_all_hypotheses ON hypotheses FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS dev_allow_all_experiments ON experiments;
CREATE POLICY dev_allow_all_experiments ON experiments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS dev_allow_all_insights ON insights;
CREATE POLICY dev_allow_all_insights ON insights FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS dev_allow_all_delivery_tasks ON delivery_tasks;
CREATE POLICY dev_allow_all_delivery_tasks ON delivery_tasks FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE opportunities IS 'Discovery track: problems worth solving, scored by confidence/effort/risk';
COMMENT ON TABLE hypotheses IS 'Discovery track: potential solutions with test methods and scale/iterate/kill thresholds';
COMMENT ON TABLE experiments IS 'Discovery track: time-boxed tests validating hypotheses';
COMMENT ON TABLE insights IS 'Discovery track: learnings captured from research and experiments';
COMMENT ON TABLE delivery_tasks IS 'Delivery track: validated work items flowing Ready → Measuring';
