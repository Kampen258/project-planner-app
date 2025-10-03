-- =============================================================================
-- COMPLETE DATABASE ENHANCEMENT SCRIPT - FIXED VERSION
-- Execute this entire script in your Supabase SQL Editor
-- This version handles missing columns and works with your actual schema
-- =============================================================================

-- First, let's add any missing columns to existing tables
-- =============================================================================

-- Add team_members column to projects if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'team_members'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN team_members text[] DEFAULT '{}';
        RAISE NOTICE 'Added team_members column to projects table';
    END IF;
END $$;

-- Add any other missing columns that might be referenced
DO $$
BEGIN
    -- Add ai_generated column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'ai_generated'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN ai_generated boolean DEFAULT false;
        RAISE NOTICE 'Added ai_generated column to projects table';
    END IF;

    -- Add context column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'context'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN context jsonb;
        RAISE NOTICE 'Added context column to projects table';
    END IF;

    -- Add success_score column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'success_score'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN success_score integer;
        RAISE NOTICE 'Added success_score column to projects table';
    END IF;
END $$;

-- =============================================================================
-- 1. TASK DEPENDENCIES - Task relationships and dependencies
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type text NOT NULL DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'follows', 'relates_to')),
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  -- Ensure no self-dependencies and no duplicate relationships
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id),
  CONSTRAINT unique_task_dependency UNIQUE(task_id, depends_on_task_id)
);

-- Enable RLS for task dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view task dependencies for their projects" ON public.task_dependencies;
DROP POLICY IF EXISTS "Users can create task dependencies for their projects" ON public.task_dependencies;
DROP POLICY IF EXISTS "Users can update task dependencies for their projects" ON public.task_dependencies;
DROP POLICY IF EXISTS "Users can delete task dependencies for their projects" ON public.task_dependencies;

-- RLS Policies for task_dependencies (simplified to work with your schema)
CREATE POLICY "Users can view task dependencies for their projects"
ON public.task_dependencies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create task dependencies for their projects"
ON public.task_dependencies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update task dependencies for their projects"
ON public.task_dependencies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete task dependencies for their projects"
ON public.task_dependencies FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND p.user_id = auth.uid()
  )
);

-- Indexes for task_dependencies
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON public.task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_created_at ON public.task_dependencies(created_at DESC);

-- =============================================================================
-- 2. PROJECT TEMPLATES - Reusable project templates
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  template_data jsonb NOT NULL DEFAULT '{}',

  -- Template settings
  is_public boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  use_count integer DEFAULT 0,

  -- Metadata
  tags text[] DEFAULT '{}',
  estimated_duration_days integer,
  complexity_level text CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced')),

  -- Ownership and timestamps
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Validation
  CONSTRAINT valid_template_data CHECK (jsonb_typeof(template_data) = 'object')
);

-- Enable RLS for project templates
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Anyone can view public templates" ON public.project_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.project_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.project_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.project_templates;

CREATE POLICY "Anyone can view public templates"
ON public.project_templates FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates"
ON public.project_templates FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates"
ON public.project_templates FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
ON public.project_templates FOR DELETE
USING (created_by = auth.uid());

-- Indexes for project_templates
CREATE INDEX IF NOT EXISTS idx_project_templates_public ON public.project_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_project_templates_category ON public.project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_created_by ON public.project_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_project_templates_use_count ON public.project_templates(use_count DESC);
CREATE INDEX IF NOT EXISTS idx_project_templates_tags ON public.project_templates USING gin(tags);

-- =============================================================================
-- 3. TASK COMMENTS - Task discussions and notes
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),

  -- Comment content
  content text NOT NULL,
  content_type text DEFAULT 'text' CHECK (content_type IN ('text', 'markdown')),

  -- Comment metadata
  is_internal boolean DEFAULT false,
  mentions uuid[] DEFAULT '{}',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Soft delete
  deleted_at timestamptz,

  CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0)
);

-- Enable RLS for task comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view comments for their project tasks" ON public.task_comments;
DROP POLICY IF EXISTS "Users can create comments on their project tasks" ON public.task_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.task_comments;

CREATE POLICY "Users can view comments for their project tasks"
ON public.task_comments FOR SELECT
USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create comments on their project tasks"
ON public.task_comments FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments"
ON public.task_comments FOR UPDATE
USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Indexes for task_comments
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON public.task_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_comments_active ON public.task_comments(task_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_task_comments_mentions ON public.task_comments USING gin(mentions);

-- =============================================================================
-- 4. PROJECT ATTACHMENTS - File management
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Associations
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,

  -- File information
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,

  -- File metadata
  description text,
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,

  -- Upload information
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  upload_session uuid,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT attachment_belongs_to_project_or_task CHECK (
    project_id IS NOT NULL OR task_id IS NOT NULL
  ),
  CONSTRAINT valid_file_size CHECK (file_size > 0),
  CONSTRAINT valid_filename CHECK (length(trim(filename)) > 0)
);

-- Enable RLS for project attachments
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (simplified)
DROP POLICY IF EXISTS "Users can view attachments for their projects" ON public.project_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their projects" ON public.project_attachments;
DROP POLICY IF EXISTS "Users can update their own attachments" ON public.project_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments or project admin can delete" ON public.project_attachments;

CREATE POLICY "Users can view attachments for their projects"
ON public.project_attachments FOR SELECT
USING (
  (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND p.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can upload attachments to their projects"
ON public.project_attachments FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid() AND
  (
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
      AND p.user_id = auth.uid()
    ))
    OR
    (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON t.project_id = p.id
      WHERE t.id = task_id
      AND p.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can update their own attachments"
ON public.project_attachments FOR UPDATE
USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete attachments for their projects"
ON public.project_attachments FOR DELETE
USING (
  uploaded_by = auth.uid() OR
  (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )) OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND p.user_id = auth.uid()
  ))
);

-- Indexes for project_attachments
CREATE INDEX IF NOT EXISTS idx_project_attachments_project_id ON public.project_attachments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_task_id ON public.project_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_uploaded_by ON public.project_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_attachments_created_at ON public.project_attachments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_attachments_mime_type ON public.project_attachments(mime_type);
CREATE INDEX IF NOT EXISTS idx_project_attachments_tags ON public.project_attachments USING gin(tags);

-- =============================================================================
-- 5. TIME TRACKING - Time logging and productivity tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.time_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Associations
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),

  -- Time information
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer,

  -- Entry details
  description text,
  activity_type text DEFAULT 'work' CHECK (activity_type IN ('work', 'meeting', 'research', 'planning', 'review')),

  -- Status and metadata
  is_billable boolean DEFAULT true,
  hourly_rate decimal(10,2),
  is_manual boolean DEFAULT false,

  -- Timer state (for active tracking)
  is_active boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (
    (end_time IS NULL AND is_active = true) OR
    (end_time IS NOT NULL AND end_time > start_time)
  ),
  CONSTRAINT valid_duration CHECK (
    (duration_minutes IS NULL AND end_time IS NULL) OR
    (duration_minutes > 0)
  )
);

-- Enable RLS for time tracking
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (simplified)
DROP POLICY IF EXISTS "Users can view time entries for their project tasks" ON public.time_tracking;
DROP POLICY IF EXISTS "Users can create time entries for assigned tasks" ON public.time_tracking;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_tracking;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_tracking;

CREATE POLICY "Users can view time entries for their project tasks"
ON public.time_tracking FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create time entries for tasks"
ON public.time_tracking FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own time entries"
ON public.time_tracking FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
ON public.time_tracking FOR DELETE
USING (user_id = auth.uid());

-- Indexes for time_tracking
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_id ON public.time_tracking(task_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id ON public.time_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_start_time ON public.time_tracking(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_time_tracking_active ON public.time_tracking(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_time_tracking_billable ON public.time_tracking(task_id, is_billable);

-- =============================================================================
-- 6. PROJECT MILESTONES - Major project checkpoints
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Milestone information
  name text NOT NULL,
  description text,
  milestone_type text DEFAULT 'checkpoint' CHECK (milestone_type IN ('checkpoint', 'deliverable', 'deadline', 'approval')),

  -- Scheduling
  due_date date,
  planned_date date,
  actual_date date,

  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
  is_critical boolean DEFAULT false,
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  -- Dependencies and ordering
  depends_on_milestone uuid REFERENCES public.project_milestones(id),
  sort_order integer DEFAULT 0,

  -- Completion information
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id),

  -- Notification settings
  notify_days_before integer DEFAULT 7,
  notification_sent boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_milestone_dates CHECK (
    (planned_date IS NULL OR due_date IS NULL OR planned_date <= due_date) AND
    (actual_date IS NULL OR status = 'completed')
  ),
  CONSTRAINT no_milestone_self_dependency CHECK (id != depends_on_milestone)
);

-- Enable RLS for project milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view milestones for their projects" ON public.project_milestones;
DROP POLICY IF EXISTS "Users can create milestones for their projects" ON public.project_milestones;
DROP POLICY IF EXISTS "Users can update milestones for their projects" ON public.project_milestones;
DROP POLICY IF EXISTS "Users can delete milestones for their projects" ON public.project_milestones;

CREATE POLICY "Users can view milestones for their projects"
ON public.project_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create milestones for their projects"
ON public.project_milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update milestones for their projects"
ON public.project_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete milestones for their projects"
ON public.project_milestones FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.user_id = auth.uid()
  )
);

-- Indexes for project_milestones
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON public.project_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON public.project_milestones(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_sort_order ON public.project_milestones(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_milestones_critical ON public.project_milestones(project_id) WHERE is_critical = true;
CREATE INDEX IF NOT EXISTS idx_project_milestones_upcoming ON public.project_milestones(due_date) WHERE status IN ('pending', 'in_progress');

-- =============================================================================
-- 7. TASK LABELS - Flexible task categorization
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.task_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Label information
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#3B82F6',

  -- Usage tracking
  usage_count integer DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_label_per_project UNIQUE(project_id, name),
  CONSTRAINT valid_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Junction table for task-label relationships
CREATE TABLE IF NOT EXISTS public.task_label_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES public.task_labels(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),

  CONSTRAINT unique_task_label UNIQUE(task_id, label_id)
);

-- Enable RLS for task labels
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_label_assignments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view labels for their projects" ON public.task_labels;
DROP POLICY IF EXISTS "Users can manage labels for their projects" ON public.task_labels;
DROP POLICY IF EXISTS "Users can view label assignments for their project tasks" ON public.task_label_assignments;
DROP POLICY IF EXISTS "Users can manage label assignments for their project tasks" ON public.task_label_assignments;

CREATE POLICY "Users can view labels for their projects"
ON public.task_labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage labels for their projects"
ON public.task_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view label assignments for their project tasks"
ON public.task_label_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage label assignments for their project tasks"
ON public.task_label_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND p.user_id = auth.uid()
  )
);

-- Indexes for task labels
CREATE INDEX IF NOT EXISTS idx_task_labels_project_id ON public.task_labels(project_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_usage_count ON public.task_labels(project_id, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_task_label_assignments_task_id ON public.task_label_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_label_assignments_label_id ON public.task_label_assignments(label_id);

-- =============================================================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate time entry duration
CREATE OR REPLACE FUNCTION public.calculate_time_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate duration when end_time is set
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;

  -- Ensure only one active timer per user per task
  IF NEW.is_active = true THEN
    UPDATE public.time_tracking
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND task_id = NEW.task_id
      AND id != COALESCE(NEW.id, gen_random_uuid())
      AND is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update project progress based on completed tasks
CREATE OR REPLACE FUNCTION public.update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  project_uuid uuid;
  total_tasks integer;
  completed_tasks integer;
  new_progress integer;
BEGIN
  -- Get the project ID from the task
  project_uuid := COALESCE(NEW.project_id, OLD.project_id);

  IF project_uuid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate progress based on completed tasks
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE completed = true) as completed
  INTO total_tasks, completed_tasks
  FROM public.tasks
  WHERE project_id = project_uuid;

  -- Calculate percentage (avoid division by zero)
  IF total_tasks > 0 THEN
    new_progress := ROUND((completed_tasks::decimal / total_tasks::decimal) * 100);
  ELSE
    new_progress := 0;
  END IF;

  -- Update project progress
  UPDATE public.projects
  SET
    progress = new_progress,
    updated_at = now()
  WHERE id = project_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to prevent circular dependencies
CREATE OR REPLACE FUNCTION public.check_circular_dependency()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if adding this dependency would create a cycle
  IF EXISTS (
    WITH RECURSIVE dependency_chain AS (
      -- Start with the new dependency
      SELECT NEW.depends_on_task_id as task_id, NEW.task_id as original_task

      UNION ALL

      -- Follow the chain of dependencies
      SELECT td.depends_on_task_id, dc.original_task
      FROM public.task_dependencies td
      JOIN dependency_chain dc ON td.task_id = dc.task_id
      WHERE td.depends_on_task_id IS NOT NULL
    )
    SELECT 1 FROM dependency_chain
    WHERE task_id = original_task
  ) THEN
    RAISE EXCEPTION 'This dependency would create a circular reference';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS SETUP - Drop existing first to avoid conflicts
-- =============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON public.task_comments;
DROP TRIGGER IF EXISTS update_time_tracking_updated_at ON public.time_tracking;
DROP TRIGGER IF EXISTS update_project_milestones_updated_at ON public.project_milestones;
DROP TRIGGER IF EXISTS update_project_templates_updated_at ON public.project_templates;
DROP TRIGGER IF EXISTS update_project_progress_on_task_change ON public.tasks;
DROP TRIGGER IF EXISTS calculate_time_duration_trigger ON public.time_tracking;
DROP TRIGGER IF EXISTS check_circular_dependency_trigger ON public.task_dependencies;

-- Recreate triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_time_tracking_updated_at
  BEFORE UPDATE ON public.time_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON public.project_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Project progress triggers
CREATE TRIGGER update_project_progress_on_task_change
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_project_progress();

-- Time tracking calculation trigger
CREATE TRIGGER calculate_time_duration_trigger
  BEFORE INSERT OR UPDATE ON public.time_tracking
  FOR EACH ROW EXECUTE FUNCTION public.calculate_time_duration();

-- Dependency validation trigger
CREATE TRIGGER check_circular_dependency_trigger
  BEFORE INSERT OR UPDATE ON public.task_dependencies
  FOR EACH ROW EXECUTE FUNCTION public.check_circular_dependency();

-- =============================================================================
-- USEFUL VIEWS FOR REPORTING (simplified to avoid team_members references)
-- =============================================================================

-- View for project statistics
CREATE OR REPLACE VIEW public.project_stats AS
SELECT
  p.id,
  p.name,
  p.status,
  p.progress,
  p.created_at,
  p.start_date,
  p.end_date,

  -- Task statistics
  COUNT(t.id) as total_tasks,
  COUNT(t.id) FILTER (WHERE t.completed = true) as completed_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as active_tasks,
  COUNT(t.id) FILTER (WHERE t.priority = 'urgent') as urgent_tasks,

  -- Time statistics
  COALESCE(SUM(tt.duration_minutes), 0) as total_time_minutes,
  COALESCE(AVG(tt.duration_minutes), 0) as avg_time_per_entry,

  -- Milestone statistics
  COUNT(pm.id) as total_milestones,
  COUNT(pm.id) FILTER (WHERE pm.status = 'completed') as completed_milestones,
  COUNT(pm.id) FILTER (WHERE pm.due_date < CURRENT_DATE AND pm.status != 'completed') as overdue_milestones

FROM public.projects p
LEFT JOIN public.tasks t ON p.id = t.project_id
LEFT JOIN public.time_tracking tt ON t.id = tt.task_id
LEFT JOIN public.project_milestones pm ON p.id = pm.project_id
GROUP BY p.id, p.name, p.status, p.progress, p.created_at, p.start_date, p.end_date;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '🎉 Enhanced Project Planner Database Schema Successfully Created!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables created: 8 new tables';
  RAISE NOTICE '✅ Functions created: 4 automation functions';
  RAISE NOTICE '✅ Triggers created: 9 automated triggers';
  RAISE NOTICE '✅ Views created: 1 reporting view';
  RAISE NOTICE '✅ RLS Policies: Complete security setup';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your project planner now has enterprise-grade functionality!';
END $$;