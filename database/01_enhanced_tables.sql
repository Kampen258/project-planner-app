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
  is_internal boolean DEFAULT false, -- Internal team notes vs client-visible
  mentions uuid[] DEFAULT '{}',      -- User IDs mentioned in comment

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
  upload_session uuid, -- For tracking multi-part uploads

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