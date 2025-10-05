import { supabase } from '../lib/supabase.client'
import type { Task, TaskInsert, TaskUpdate, DbTask, DbTaskInsert } from '../types'

// Type for task with user context
export interface TaskWithProject extends Task {
  project_name?: string;
  project_status?: string;
}

// Helper function to convert database task to component task
function transformSupabaseTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    project_id: dbTask.project_id,
    name: dbTask.name,
    description: dbTask.description,
    due_date: dbTask.due_date,
    priority: dbTask.priority,
    status: dbTask.status,
    completed: dbTask.completed,
    created_at: dbTask.created_at,
    updated_at: dbTask.updated_at,
    user_id: dbTask.user_id,
    ai_suggested: dbTask.ai_suggested,
    order_index: dbTask.order_index,
    assigned_to: dbTask.assigned_to,
    completed_at: dbTask.completed_at,
  };
}

// Helper function to convert component task to database insert
function transformToSupabaseTask(task: Partial<Task>): Partial<DbTaskInsert> {
  const dbInsert: Partial<DbTaskInsert> = {
    project_id: task.project_id,
    name: task.name,
    description: task.description,
    due_date: task.due_date,
    priority: task.priority,
    status: task.status,
    completed: task.completed,
    user_id: task.user_id,
    ai_suggested: task.ai_suggested,
    order_index: task.order_index,
    assigned_to: task.assigned_to,
  };
  return dbInsert;
}

export class TaskService {
  // Get all tasks for a project
  static async getTasksByProject(projectId: string, userId: string): Promise<Task[]> {
    try {
      console.log(`🔍 Fetching tasks for project: ${projectId}`)

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects!inner(user_id)
        `)
        .eq('project_id', projectId)
        .eq('projects.user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching tasks:', error)
        return []
      }

      console.log(`✅ Retrieved ${data?.length || 0} tasks from database`)
      return data || []
    } catch (error) {
      console.error('❌ Error in getTasksByProject:', error)
      return []
    }
  }

  // Create a new task
  static async createTask(taskData: Partial<Task>): Promise<Task | null> {
    try {
      console.log(`💾 Creating task in database:`, taskData)
      const supabaseData = transformToSupabaseTask(taskData)
      console.log(`🔄 Transformed data:`, supabaseData)

      const { data, error } = await supabase
        .from('tasks')
        .insert([supabaseData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating task:', error)
        return null
      }

      const createdTask = data ? transformSupabaseTask(data) : null
      console.log(`✅ Task created in database:`, createdTask)

      return createdTask
    } catch (error) {
      console.error('❌ Error in createTask:', error)
      return null
    }
  }

  // Update an existing task
  static async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
    try {
      const supabaseData = transformToSupabaseTask(taskData)

      const { data, error } = await supabase
        .from('tasks')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        return null
      }

      return data ? transformSupabaseTask(data) : null
    } catch (error) {
      console.error('Error in updateTask:', error)
      return null
    }
  }

  // Delete a task
  static async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting task:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteTask:', error)
      return false
    }
  }

  // Toggle task completion
  static async toggleTaskCompletion(id: string, completed: boolean): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed,
          status: completed ? 'completed' : 'todo',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling task completion:', error)
        return null
      }

      return data ? transformSupabaseTask(data) : null
    } catch (error) {
      console.error('Error in toggleTaskCompletion:', error)
      return null
    }
  }

  // Get all tasks for a project (simplified version)
  static async getTasks(projectId: string): Promise<Task[]> {
    try {
      console.log(`🔍 Fetching tasks for project: ${projectId}`)

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('❌ Error fetching tasks:', error)
        return []
      }

      console.log(`✅ Retrieved ${data?.length || 0} tasks from database`)
      return (data || []).map(transformSupabaseTask)
    } catch (error) {
      console.error('❌ Error in getTasks:', error)
      return []
    }
  }

  // Get task statistics for a project
  static async getProjectTaskStats(projectId: string, userId?: string): Promise<{
    total: number
    completed: number
    inProgress: number
    todo: number
    overdue: number
  }> {
    try {
      const tasks = userId
        ? await this.getTasksByProject(projectId, userId)
        : await this.getTasks(projectId)
      const now = new Date()

      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: tasks.filter(t =>
          t.due_date &&
          new Date(t.due_date) < now &&
          !t.completed
        ).length
      }

      return stats
    } catch (error) {
      console.error('Error in getProjectTaskStats:', error)
      return { total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 }
    }
  }
}