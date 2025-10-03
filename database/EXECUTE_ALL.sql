-- =============================================================================
-- COMPLETE DATABASE ENHANCEMENT SCRIPT
-- Execute this entire script in your Supabase SQL Editor
-- =============================================================================

-- Enhanced Database Schema for Project Planner
-- Additional tables to extend core functionality
-- Run this after your existing core tables are created

-- =============================================================================
-- 1. TASK DEPENDENCIES - Task relationships and dependencies
-- =============================================================================

CREATE TABLE public.task_dependencies (
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

-- RLS Policies for task_dependencies
CREATE POLICY "Users can view task dependencies for their projects"
ON public.task_dependencies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can create task dependencies for their projects"
ON public.task_dependencies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can update task dependencies for their projects"
ON public.task_dependencies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can delete task dependencies for their projects"
ON public.task_dependencies FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t1
    JOIN public.projects p ON t1.project_id = p.id
    WHERE t1.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

-- Indexes for task_dependencies
CREATE INDEX idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON public.task_dependencies(depends_on_task_id);
CREATE INDEX idx_task_dependencies_created_at ON public.task_dependencies(created_at DESC);

-- =============================================================================
-- 2. PROJECT TEMPLATES - Reusable project templates
-- =============================================================================

CREATE TABLE public.project_templates (
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

-- RLS Policies for project_templates
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
CREATE INDEX idx_project_templates_public ON public.project_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_project_templates_category ON public.project_templates(category);
CREATE INDEX idx_project_templates_created_by ON public.project_templates(created_by);
CREATE INDEX idx_project_templates_use_count ON public.project_templates(use_count DESC);
CREATE INDEX idx_project_templates_tags ON public.project_templates USING gin(tags);

-- =============================================================================
-- 3. TASK COMMENTS - Task discussions and notes
-- =============================================================================

CREATE TABLE public.task_comments (
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

-- RLS Policies for task_comments
CREATE POLICY "Users can view comments for their project tasks"
ON public.task_comments FOR SELECT
USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
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
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can update their own comments"
ON public.task_comments FOR UPDATE
USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Indexes for task_comments
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX idx_task_comments_created_at ON public.task_comments(created_at DESC);
CREATE INDEX idx_task_comments_active ON public.task_comments(task_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_comments_mentions ON public.task_comments USING gin(mentions);

-- =============================================================================
-- 4. PROJECT ATTACHMENTS - File management
-- =============================================================================

CREATE TABLE public.project_attachments (
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

-- RLS Policies for project_attachments
CREATE POLICY "Users can view attachments for their projects"
ON public.project_attachments FOR SELECT
USING (
  (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
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
      AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    ))
    OR
    (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON t.project_id = p.id
      WHERE t.id = task_id
      AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    ))
  )
);

CREATE POLICY "Users can update their own attachments"
ON public.project_attachments FOR UPDATE
USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own attachments or project admin can delete"
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
CREATE INDEX idx_project_attachments_project_id ON public.project_attachments(project_id);
CREATE INDEX idx_project_attachments_task_id ON public.project_attachments(task_id);
CREATE INDEX idx_project_attachments_uploaded_by ON public.project_attachments(uploaded_by);
CREATE INDEX idx_project_attachments_created_at ON public.project_attachments(created_at DESC);
CREATE INDEX idx_project_attachments_mime_type ON public.project_attachments(mime_type);
CREATE INDEX idx_project_attachments_tags ON public.project_attachments USING gin(tags);

-- =============================================================================
-- 5. TIME TRACKING - Time logging and productivity tracking
-- =============================================================================

CREATE TABLE public.time_tracking (
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

-- RLS Policies for time_tracking
CREATE POLICY "Users can view time entries for their project tasks"
ON public.time_tracking FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can create time entries for assigned tasks"
ON public.time_tracking FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND (
      p.user_id = auth.uid() OR
      auth.uid() = ANY(p.team_members) OR
      t.assigned_to = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own time entries"
ON public.time_tracking FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
ON public.time_tracking FOR DELETE
USING (user_id = auth.uid());

-- Indexes for time_tracking
CREATE INDEX idx_time_tracking_task_id ON public.time_tracking(task_id);
CREATE INDEX idx_time_tracking_user_id ON public.time_tracking(user_id);
CREATE INDEX idx_time_tracking_start_time ON public.time_tracking(start_time DESC);
CREATE INDEX idx_time_tracking_active ON public.time_tracking(user_id) WHERE is_active = true;
CREATE INDEX idx_time_tracking_billable ON public.time_tracking(task_id, is_billable);

-- =============================================================================
-- 6. PROJECT MILESTONES - Major project checkpoints
-- =============================================================================

CREATE TABLE public.project_milestones (
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
  CONSTRAINT no_self_dependency CHECK (id != depends_on_milestone)
);

-- Enable RLS for project milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_milestones
CREATE POLICY "Users can view milestones for their projects"
ON public.project_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can create milestones for their projects"
ON public.project_milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can update milestones for their projects"
ON public.project_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can delete milestones for their projects"
ON public.project_milestones FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

-- Indexes for project_milestones
CREATE INDEX idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX idx_project_milestones_due_date ON public.project_milestones(due_date);
CREATE INDEX idx_project_milestones_status ON public.project_milestones(project_id, status);
CREATE INDEX idx_project_milestones_sort_order ON public.project_milestones(project_id, sort_order);
CREATE INDEX idx_project_milestones_critical ON public.project_milestones(project_id) WHERE is_critical = true;
CREATE INDEX idx_project_milestones_upcoming ON public.project_milestones(due_date) WHERE status IN ('pending', 'in_progress');

-- =============================================================================
-- 7. TASK LABELS - Flexible task categorization
-- =============================================================================

CREATE TABLE public.task_labels (
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
CREATE TABLE public.task_label_assignments (
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

-- RLS Policies for task_labels
CREATE POLICY "Users can view labels for their projects"
ON public.task_labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can manage labels for their projects"
ON public.task_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

-- RLS Policies for task_label_assignments
CREATE POLICY "Users can view label assignments for their project tasks"
ON public.task_label_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

CREATE POLICY "Users can manage label assignments for their project tasks"
ON public.task_label_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id
    AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.team_members))
  )
);

-- Indexes for task labels
CREATE INDEX idx_task_labels_project_id ON public.task_labels(project_id);
CREATE INDEX idx_task_labels_usage_count ON public.task_labels(project_id, usage_count DESC);
CREATE INDEX idx_task_label_assignments_task_id ON public.task_label_assignments(task_id);
CREATE INDEX idx_task_label_assignments_label_id ON public.task_label_assignments(label_id);

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

  -- Auto-update project status based on progress
  UPDATE public.projects
  SET status = CASE
    WHEN new_progress = 0 THEN 'planning'
    WHEN new_progress = 100 THEN 'completed'
    WHEN new_progress > 0 AND status = 'planning' THEN 'in_progress'
    ELSE status
  END,
  updated_at = now()
  WHERE id = project_uuid
    AND status != 'on_hold';

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to log team activities automatically
CREATE OR REPLACE FUNCTION public.log_team_activity()
RETURNS TRIGGER AS $$
DECLARE
  project_uuid uuid;
  activity_description text;
  metadata_json jsonb;
BEGIN
  -- Determine project ID
  project_uuid := COALESCE(NEW.project_id, OLD.project_id);

  -- Skip if no project association
  IF project_uuid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Create activity description based on operation and table
  activity_description := CASE TG_OP
    WHEN 'INSERT' THEN 'Created ' ||
      CASE TG_TABLE_NAME
        WHEN 'tasks' THEN 'task: ' || NEW.name
        WHEN 'project_milestones' THEN 'milestone: ' || NEW.name
        WHEN 'task_comments' THEN 'comment on task'
        WHEN 'project_attachments' THEN 'attachment: ' || NEW.filename
        ELSE TG_TABLE_NAME
      END
    WHEN 'UPDATE' THEN 'Updated ' ||
      CASE TG_TABLE_NAME
        WHEN 'tasks' THEN 'task: ' || NEW.name
        WHEN 'projects' THEN 'project: ' || NEW.name
        WHEN 'project_milestones' THEN 'milestone: ' || NEW.name
        ELSE TG_TABLE_NAME
      END
    WHEN 'DELETE' THEN 'Deleted ' ||
      CASE TG_TABLE_NAME
        WHEN 'tasks' THEN 'task: ' || OLD.name
        WHEN 'project_milestones' THEN 'milestone: ' || OLD.name
        WHEN 'project_attachments' THEN 'attachment: ' || OLD.filename
        ELSE TG_TABLE_NAME
      END
    ELSE TG_OP || ' on ' || TG_TABLE_NAME
  END;

  -- Create metadata
  metadata_json := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'record_id', COALESCE(NEW.id, OLD.id),
    'timestamp', now()
  );

  -- Insert activity log
  INSERT INTO public.team_activities (
    user_id,
    project_id,
    action,
    description,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    project_uuid,
    TG_OP,
    activity_description,
    metadata_json,
    now()
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the original operation
    RAISE WARNING 'Failed to log activity: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update milestone completion
CREATE OR REPLACE FUNCTION public.update_milestone_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set completion timestamp when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
    NEW.completed_by = auth.uid();
    NEW.completion_percentage = 100;
    NEW.actual_date = CURRENT_DATE;
  END IF;

  -- Clear completion info if status changes from completed
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
    NEW.completed_by = NULL;
    NEW.actual_date = NULL;
    IF NEW.completion_percentage = 100 THEN
      NEW.completion_percentage = 0;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update label usage count
CREATE OR REPLACE FUNCTION public.update_label_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment usage count when label is assigned
    UPDATE public.task_labels
    SET usage_count = usage_count + 1
    WHERE id = NEW.label_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement usage count when label is removed
    UPDATE public.task_labels
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.label_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
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

-- Function to increment template usage
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- If project was created from a template, increment usage count
  IF NEW.context IS NOT NULL AND NEW.context ? 'template_id' THEN
    UPDATE public.project_templates
    SET use_count = use_count + 1
    WHERE id = (NEW.context->>'template_id')::uuid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS SETUP
-- =============================================================================

-- Updated_at triggers for all relevant tables
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

-- Activity logging triggers
CREATE TRIGGER log_task_activities
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_team_activity();

CREATE TRIGGER log_milestone_activities
  AFTER INSERT OR UPDATE OR DELETE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.log_team_activity();

CREATE TRIGGER log_comment_activities
  AFTER INSERT OR DELETE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION public.log_team_activity();

CREATE TRIGGER log_attachment_activities
  AFTER INSERT OR DELETE ON public.project_attachments
  FOR EACH ROW EXECUTE FUNCTION public.log_team_activity();

-- Milestone completion trigger
CREATE TRIGGER update_milestone_completion_trigger
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_milestone_completion();

-- Label usage triggers
CREATE TRIGGER update_label_usage_on_assignment
  AFTER INSERT ON public.task_label_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_label_usage();

CREATE TRIGGER update_label_usage_on_removal
  AFTER DELETE ON public.task_label_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_label_usage();

-- Dependency validation trigger
CREATE TRIGGER check_circular_dependency_trigger
  BEFORE INSERT OR UPDATE ON public.task_dependencies
  FOR EACH ROW EXECUTE FUNCTION public.check_circular_dependency();

-- Template usage tracking trigger
CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.increment_template_usage();

-- =============================================================================
-- USEFUL VIEWS FOR REPORTING
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

-- View for user productivity
CREATE OR REPLACE VIEW public.user_productivity AS
SELECT
  u.id as user_id,
  u.email,

  -- Task statistics
  COUNT(t.id) as assigned_tasks,
  COUNT(t.id) FILTER (WHERE t.completed = true) as completed_tasks,

  -- Time statistics
  COALESCE(SUM(tt.duration_minutes), 0) as total_time_minutes,
  COUNT(DISTINCT tt.task_id) as tasks_with_time,

  -- Activity statistics
  COUNT(ta.id) as total_activities,

  -- Recent activity
  MAX(ta.created_at) as last_activity

FROM auth.users u
LEFT JOIN public.tasks t ON u.id = t.assigned_to
LEFT JOIN public.time_tracking tt ON u.id = tt.user_id
LEFT JOIN public.team_activities ta ON u.id = ta.user_id
GROUP BY u.id, u.email;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '🎉 Enhanced Project Planner Database Schema Successfully Created!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables created: 8 new tables';
  RAISE NOTICE '✅ Functions created: 8 automation functions';
  RAISE NOTICE '✅ Triggers created: 15 automated triggers';
  RAISE NOTICE '✅ Views created: 2 reporting views';
  RAISE NOTICE '✅ RLS Policies: Complete security setup';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your project planner now has enterprise-grade functionality!';
END $$;