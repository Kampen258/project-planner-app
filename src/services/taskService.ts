import { supabase } from '../lib/supabase'

export interface Task {
  id: string
  project_id: string
  name: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  completed: boolean
  created_at: string
  updated_at: string
}

export interface SupabaseTask {
  id: string
  project_id: string
  name: string
  description: string | null
  due_date: string | null
  priority: string
  status: string
  completed: boolean
  created_at: string
  updated_at: string
}

// Convert Supabase task to app task format
function transformSupabaseTask(task: SupabaseTask): Task {
  return {
    id: task.id,
    project_id: task.project_id,
    name: task.name,
    description: task.description,
    due_date: task.due_date,
    priority: task.priority as Task['priority'],
    status: task.status as Task['status'],
    completed: task.completed,
    created_at: task.created_at,
    updated_at: task.updated_at
  }
}

// Convert app task to Supabase format
function transformToSupabaseTask(task: Partial<Task>): Partial<SupabaseTask> {
  return {
    project_id: task.project_id,
    name: task.name || '',
    description: task.description || null,
    due_date: task.due_date || null,
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    completed: task.completed || false,
    updated_at: new Date().toISOString()
  }
}

export class TaskService {
  // Get all tasks for a project
  static async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      console.log(`🔍 Fetching tasks for project: ${projectId}`)

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching tasks:', error)
        return []
      }

      const tasks = data ? data.map(transformSupabaseTask) : []
      console.log(`✅ Retrieved ${tasks.length} tasks from database`)

      return tasks
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

  // Get task statistics for a project
  static async getProjectTaskStats(projectId: string): Promise<{
    total: number
    completed: number
    inProgress: number
    todo: number
    overdue: number
  }> {
    try {
      const tasks = await this.getTasksByProject(projectId)
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