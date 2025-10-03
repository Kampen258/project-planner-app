-- Time Tracking and Milestones Tables
-- Part 2 of Enhanced Database Schema

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
  hourly_rate decimal(10,2), -- Optional billing rate
  is_manual boolean DEFAULT false, -- Manual vs automatic time tracking

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
  color text NOT NULL DEFAULT '#3B82F6', -- Hex color code

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