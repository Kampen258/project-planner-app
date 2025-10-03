import { supabase } from '../lib/supabase'
import type { Project } from '../types'

export class ProjectService {

  // Get all projects for the current user
  static async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllProjects:', error)
      return []
    }
  }

  // Create a new project
  static async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          ai_generated: projectData.ai_generated || false,
          progress: projectData.progress || 0,
          status: projectData.status || 'planning'
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

  // Update an existing project
  static async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    try {
      // Remove read-only fields
      const { id: _, created_at: __, ...updateData } = projectData as any

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
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

  // Delete a project
  static async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
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

  // Get a single project by ID
  static async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getProject:', error)
      return null
    }
  }

  // Get projects by status
  static async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects by status:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProjectsByStatus:', error)
      return []
    }
  }

  // Update project progress
  static async updateProjectProgress(id: string, progress: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ progress })
        .eq('id', id)

      if (error) {
        console.error('Error updating project progress:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateProjectProgress:', error)
      return false
    }
  }

  // Update project success score
  static async updateSuccessScore(id: string, success_score: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ success_score })
        .eq('id', id)

      if (error) {
        console.error('Error updating success score:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateSuccessScore:', error)
      return false
    }
  }

  // Search projects
  static async searchProjects(query: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching projects:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchProjects:', error)
      return []
    }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing database connection...')
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

      // Test basic connection to projects table
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Database connection error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })

        // Check for common error patterns
        if (error.message.includes('relation "public.projects" does not exist')) {
          console.log('❌ Projects table does not exist - please create it in Supabase dashboard')
          return false
        }

        if (error.message.includes('JWT')) {
          console.log('❌ Authentication error - check your Supabase keys')
          return false
        }

        if (error.message.includes('policy')) {
          console.log('❌ Row Level Security policy error - check your RLS policies')
          return false
        }

        return false
      }

      console.log('✅ Database connection successful')
      console.log('Projects found:', data?.length || 0)
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }
}