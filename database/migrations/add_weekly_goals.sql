-- Migration: Add Weekly Goals system
-- Creates table for weekly goal tracking similar to paper planner

-- Create weekly_goals table
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  day VARCHAR(10) NOT NULL CHECK (day IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
  week_start DATE NOT NULL, -- Monday of the week (YYYY-MM-DD format)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user ON weekly_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_week ON weekly_goals(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_task ON weekly_goals(task_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_day_week ON weekly_goals(day, week_start);

-- Enable Row Level Security
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own weekly goals" ON weekly_goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own weekly goals" ON weekly_goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own weekly goals" ON weekly_goals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own weekly goals" ON weekly_goals
  FOR DELETE USING (user_id = auth.uid());

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_weekly_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_weekly_goals_updated_at ON weekly_goals;
CREATE TRIGGER trigger_weekly_goals_updated_at
  BEFORE UPDATE ON weekly_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_goals_updated_at();

-- Create view for weekly goal statistics
CREATE OR REPLACE VIEW weekly_goal_stats AS
SELECT
  user_id,
  week_start,
  day,
  COUNT(*) as total_goals,
  COUNT(CASE WHEN completed = true THEN 1 END) as completed_goals,
  ROUND(
    (COUNT(CASE WHEN completed = true THEN 1 END)::DECIMAL / COUNT(*)) * 100,
    1
  ) as completion_percentage
FROM weekly_goals
GROUP BY user_id, week_start, day;

-- Create view for user's weekly overview
CREATE OR REPLACE VIEW user_weekly_overview AS
SELECT
  wg.user_id,
  wg.week_start,
  COUNT(*) as total_goals,
  COUNT(CASE WHEN wg.completed = true THEN 1 END) as completed_goals,
  ROUND(
    (COUNT(CASE WHEN wg.completed = true THEN 1 END)::DECIMAL / COUNT(*)) * 100,
    1
  ) as week_completion_percentage,
  COUNT(CASE WHEN wg.task_id IS NOT NULL THEN 1 END) as task_linked_goals,
  ARRAY_AGG(
    DISTINCT wg.day ORDER BY
    CASE wg.day
      WHEN 'MONDAY' THEN 1
      WHEN 'TUESDAY' THEN 2
      WHEN 'WEDNESDAY' THEN 3
      WHEN 'THURSDAY' THEN 4
      WHEN 'FRIDAY' THEN 5
      WHEN 'SATURDAY' THEN 6
      WHEN 'SUNDAY' THEN 7
    END
  ) as active_days
FROM weekly_goals wg
GROUP BY wg.user_id, wg.week_start;

-- Add RLS to views
ALTER VIEW weekly_goal_stats OWNER TO postgres;
ALTER VIEW user_weekly_overview OWNER TO postgres;

COMMENT ON TABLE weekly_goals IS 'Stores weekly goals organized by days, similar to paper planner format';
COMMENT ON COLUMN weekly_goals.week_start IS 'Monday date of the week (YYYY-MM-DD), used for week grouping';
COMMENT ON COLUMN weekly_goals.day IS 'Day of week in uppercase (MONDAY, TUESDAY, etc.)';
COMMENT ON COLUMN weekly_goals.task_id IS 'Optional link to existing task from tasks table';
COMMENT ON VIEW weekly_goal_stats IS 'Statistics for weekly goals grouped by user, week, and day';
COMMENT ON VIEW user_weekly_overview IS 'Overall weekly completion statistics per user';