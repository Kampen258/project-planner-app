-- Migration: Add OKR (Objectives & Key Results) system
-- This adds the foundation for New Agile methodology OKR tracking

-- Create objectives table
CREATE TABLE IF NOT EXISTS objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  owner_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create key results table
CREATE TABLE IF NOT EXISTS key_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  baseline DECIMAL DEFAULT 0,
  target DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT DEFAULT '%',
  measurement_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'at_risk', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create key result updates for tracking progress over time
CREATE TABLE IF NOT EXISTS key_result_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_result_id UUID REFERENCES key_results(id) ON DELETE CASCADE,
  value DECIMAL NOT NULL,
  note TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add objective_id to existing projects table to link projects to OKRs
ALTER TABLE projects ADD COLUMN IF NOT EXISTS objective_id UUID REFERENCES objectives(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_objectives_owner ON objectives(owner_id);
CREATE INDEX IF NOT EXISTS idx_objectives_quarter_year ON objectives(quarter, year);
CREATE INDEX IF NOT EXISTS idx_key_results_objective ON key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_key_result_updates_kr ON key_result_updates(key_result_id);
CREATE INDEX IF NOT EXISTS idx_projects_objective ON projects(objective_id);

-- Enable Row Level Security (RLS)
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_result_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for objectives
CREATE POLICY "Users can view objectives they own or are team members of" ON objectives
  FOR SELECT USING (
    owner_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid() OR auth.uid() = ANY(team_members::uuid[])
    )
  );

CREATE POLICY "Users can create objectives" ON objectives
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their objectives" ON objectives
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their objectives" ON objectives
  FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for key results
CREATE POLICY "Users can view key results for objectives they can access" ON key_results
  FOR SELECT USING (
    objective_id IN (
      SELECT id FROM objectives
      WHERE owner_id = auth.uid() OR
      project_id IN (
        SELECT id FROM projects
        WHERE user_id = auth.uid() OR auth.uid() = ANY(team_members::uuid[])
      )
    )
  );

CREATE POLICY "Users can create key results for their objectives" ON key_results
  FOR INSERT WITH CHECK (
    objective_id IN (SELECT id FROM objectives WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update key results for their objectives" ON key_results
  FOR UPDATE USING (
    objective_id IN (SELECT id FROM objectives WHERE owner_id = auth.uid())
  );

-- Create RLS policies for key result updates
CREATE POLICY "Users can view updates for accessible key results" ON key_result_updates
  FOR SELECT USING (
    key_result_id IN (
      SELECT kr.id FROM key_results kr
      JOIN objectives o ON kr.objective_id = o.id
      WHERE o.owner_id = auth.uid() OR
      o.project_id IN (
        SELECT id FROM projects
        WHERE user_id = auth.uid() OR auth.uid() = ANY(team_members::uuid[])
      )
    )
  );

CREATE POLICY "Users can create updates for accessible key results" ON key_result_updates
  FOR INSERT WITH CHECK (
    key_result_id IN (
      SELECT kr.id FROM key_results kr
      JOIN objectives o ON kr.objective_id = o.id
      WHERE o.owner_id = auth.uid() OR
      o.project_id IN (
        SELECT id FROM projects
        WHERE user_id = auth.uid() OR auth.uid() = ANY(team_members::uuid[])
      )
    ) AND updated_by = auth.uid()
  );

-- Create function to automatically update key result current_value when new update is added
CREATE OR REPLACE FUNCTION update_key_result_current_value()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE key_results
  SET current_value = NEW.value, updated_at = NOW()
  WHERE id = NEW.key_result_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_key_result_value ON key_result_updates;
CREATE TRIGGER trigger_update_key_result_value
  AFTER INSERT ON key_result_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_key_result_current_value();

-- Create view for OKR progress summary
CREATE OR REPLACE VIEW okr_progress_summary AS
SELECT
  o.id as objective_id,
  o.title as objective_title,
  o.quarter,
  o.year,
  o.status as objective_status,
  COUNT(kr.id) as total_key_results,
  COUNT(CASE WHEN kr.status = 'completed' THEN 1 END) as completed_key_results,
  AVG(
    CASE
      WHEN kr.target != 0 THEN (kr.current_value / kr.target) * 100
      ELSE 0
    END
  ) as avg_progress_percentage,
  o.created_at,
  o.updated_at
FROM objectives o
LEFT JOIN key_results kr ON o.id = kr.objective_id
GROUP BY o.id, o.title, o.quarter, o.year, o.status, o.created_at, o.updated_at;

COMMENT ON TABLE objectives IS 'Stores OKR objectives - what teams want to achieve';
COMMENT ON TABLE key_results IS 'Stores key results - measurable outcomes for objectives';
COMMENT ON TABLE key_result_updates IS 'Tracks progress updates for key results over time';
COMMENT ON VIEW okr_progress_summary IS 'Provides aggregated progress view of OKRs';