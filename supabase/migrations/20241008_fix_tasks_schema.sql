-- Fix tasks table schema to match TypeScript interface
-- This adds the missing columns required by the application

-- Add missing columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS ai_suggested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assigned_to TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_ai_suggested ON tasks(ai_suggested);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);

-- Add foreign key constraint for user_id (assuming users table exists)
-- Uncomment this if you have a users table
-- ALTER TABLE tasks
-- ADD CONSTRAINT fk_tasks_user_id
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing tasks to have proper order_index values using a CTE
WITH ranked_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as new_order_index
  FROM tasks
  WHERE order_index IS NULL
)
UPDATE tasks
SET order_index = ranked_tasks.new_order_index
FROM ranked_tasks
WHERE tasks.id = ranked_tasks.id;

-- Make sure order_index is not null for future inserts
ALTER TABLE tasks ALTER COLUMN order_index SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN order_index SET DEFAULT 0;

-- Create a function to auto-set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set completed_at when status changes to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
        NEW.completed = TRUE;
    END IF;

    -- Clear completed_at when status changes away from completed
    IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
        NEW.completed_at = NULL;
        NEW.completed = FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set completed_at
DROP TRIGGER IF EXISTS set_task_completed_at ON tasks;
CREATE TRIGGER set_task_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_completed_at();