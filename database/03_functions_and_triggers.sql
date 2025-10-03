-- Database Functions and Triggers
-- Part 3 of Enhanced Database Schema
-- Advanced automation and business logic

-- =============================================================================
-- UTILITY FUNCTIONS
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

-- =============================================================================
-- PROJECT PROGRESS CALCULATION
-- =============================================================================

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
    AND status != 'on_hold'; -- Don't auto-change if manually set to on_hold

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ACTIVITY LOGGING
-- =============================================================================

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

  -- Add specific metadata based on table
  IF TG_TABLE_NAME = 'tasks' THEN
    metadata_json := metadata_json || jsonb_build_object(
      'task_status', COALESCE(NEW.status, OLD.status),
      'task_priority', COALESCE(NEW.priority, OLD.priority),
      'completed', COALESCE(NEW.completed, OLD.completed)
    );
  ELSIF TG_TABLE_NAME = 'project_milestones' THEN
    metadata_json := metadata_json || jsonb_build_object(
      'milestone_status', COALESCE(NEW.status, OLD.status),
      'due_date', COALESCE(NEW.due_date, OLD.due_date)
    );
  END IF;

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

-- =============================================================================
-- MILESTONE PROGRESS TRACKING
-- =============================================================================

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

-- =============================================================================
-- LABEL USAGE TRACKING
-- =============================================================================

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

-- =============================================================================
-- DEPENDENCY VALIDATION
-- =============================================================================

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
-- PROJECT TEMPLATE USAGE TRACKING
-- =============================================================================

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
-- CLEANUP FUNCTIONS
-- =============================================================================

-- Function to archive completed projects older than specified days
CREATE OR REPLACE FUNCTION public.archive_old_projects(days_old integer DEFAULT 90)
RETURNS integer AS $$
DECLARE
  archived_count integer;
BEGIN
  -- You could move to an archive table or just update a flag
  UPDATE public.projects
  SET updated_at = now()
  WHERE status = 'completed'
    AND updated_at < (CURRENT_DATE - INTERVAL '1 day' * days_old);

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old time tracking entries
CREATE OR REPLACE FUNCTION public.cleanup_old_time_entries(days_old integer DEFAULT 365)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.time_tracking
  WHERE created_at < (CURRENT_DATE - INTERVAL '1 day' * days_old)
    AND is_active = false;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;