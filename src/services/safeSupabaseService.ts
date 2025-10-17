/**
 * Safe Supabase Service - Import-safe database operations
 * No immediate execution, no problematic dependencies
 */

import { createClient } from '@supabase/supabase-js'

// Safe types (inline to avoid import issues)
interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  created_at: string
  updated_at: string
  user_id?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  project_id: string
  created_at: string
  due_date?: string
}

class SafeSupabaseService {
  private supabase: any = null
  private initialized = false

  // Safe initialization - only when needed
  private async ensureInitialized() {
    if (this.initialized) return true

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Supabase credentials not found - using mock data')
        return false
      }

      this.supabase = createClient(supabaseUrl, supabaseKey)
      this.initialized = true
      console.log('✅ SafeSupabaseService initialized')
      return true
    } catch (error) {
      console.error('❌ SafeSupabaseService initialization failed:', error)
      return false
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        return this.getMockProjects()
      }

      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        return this.getMockProjects()
      }

      return data || []
    } catch (error) {
      console.error('Error in getProjects:', error)
      return this.getMockProjects()
    }
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        const mockProject: Project = {
          id: `mock-${Date.now()}`,
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        console.log('📝 Created mock project:', mockProject)
        return mockProject
      }

      const { data, error } = await this.supabase
        .from('projects')
        .insert([{
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createProject:', error)
      return null
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        console.log('📝 Mock updated project:', id, updates)
        return { id, ...updates } as Project
      }

      const { data, error } = await this.supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateProject:', error)
      return null
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        console.log('📝 Mock deleted project:', id)
        return true
      }

      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting project:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteProject:', error)
      return false
    }
  }

  // Tasks
  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        return this.getMockTasks(projectId)
      }

      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
        return this.getMockTasks(projectId)
      }

      return data || []
    } catch (error) {
      console.error('Error in getProjectTasks:', error)
      return this.getMockTasks(projectId)
    }
  }

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        const mockTask: Task = {
          id: `mock-task-${Date.now()}`,
          ...task,
          created_at: new Date().toISOString()
        }
        console.log('📝 Created mock task:', mockTask)
        return mockTask
      }

      const { data, error } = await this.supabase
        .from('tasks')
        .insert([{
          ...task,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createTask:', error)
      return null
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        console.log('📝 Mock updated task:', id, updates)
        return { id, ...updates } as Task
      }

      const { data, error } = await this.supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateTask:', error)
      return null
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        console.log('📝 Mock deleted task:', id)
        return true
      }

      const { error } = await this.supabase
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

  async getAllTasks(): Promise<Task[]> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) {
        return this.getAllMockTasks()
      }

      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all tasks:', error)
        return this.getAllMockTasks()
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllTasks:', error)
      return this.getAllMockTasks()
    }
  }

  // Mock data for when Supabase isn't available
  private getMockProjects(): Project[] {
    return [
      {
        id: 'mock-1',
        name: 'ProjectFlow Development',
        description: 'Building a comprehensive project management tool',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: 'mock-2',
        name: 'AI Integration',
        description: 'Adding Claude AI and voice assistance features',
        status: 'planning',
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z'
      },
      {
        id: 'mock-3',
        name: 'Team Collaboration',
        description: 'Real-time collaboration features',
        status: 'on-hold',
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-18T00:00:00Z'
      }
    ]
  }

  private getMockTasks(projectId: string): Task[] {
    return [
      {
        id: `mock-task-1-${projectId}`,
        title: 'Setup project structure',
        description: 'Initialize the basic project architecture',
        status: 'done',
        priority: 'high',
        project_id: projectId,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: `mock-task-2-${projectId}`,
        title: 'Implement core features',
        description: 'Build the main functionality',
        status: 'in-progress',
        priority: 'high',
        project_id: projectId,
        created_at: '2024-01-05T00:00:00Z'
      },
      {
        id: `mock-task-3-${projectId}`,
        title: 'Add testing',
        description: 'Comprehensive test coverage',
        status: 'todo',
        priority: 'medium',
        project_id: projectId,
        created_at: '2024-01-10T00:00:00Z'
      }
    ]
  }

  private getAllMockTasks(): Task[] {
    const mockProjects = this.getMockProjects()
    const allTasks: Task[] = []

    mockProjects.forEach(project => {
      const projectTasks = this.getMockTasks(project.id)
      allTasks.push(...projectTasks)
    })

    return allTasks
  }

  // Health check
  async checkConnection(): Promise<boolean> {
    try {
      const isConnected = await this.ensureInitialized()
      if (!isConnected) return false

      // Simple query to test connection
      const { error } = await this.supabase
        .from('projects')
        .select('id')
        .limit(1)

      return !error
    } catch (error) {
      console.error('Connection check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const safeSupabaseService = new SafeSupabaseService()
export type { Project, Task }