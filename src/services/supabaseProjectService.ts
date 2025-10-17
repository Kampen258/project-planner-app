import { supabase } from '../lib/supabase';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  Task,
  TaskInsert,
  TaskUpdate,
  Constants
} from '../lib/database.types';

// Use the convenient type aliases
export type SupabaseProject = Project;
export type SupabaseProjectInsert = ProjectInsert;
export type SupabaseProjectUpdate = ProjectUpdate;

export type SupabaseTask = Task;
export type SupabaseTaskInsert = TaskInsert;
export type SupabaseTaskUpdate = TaskUpdate;

export class SupabaseProjectService {
  // Project Methods
  static async createProject(project: SupabaseProjectInsert): Promise<SupabaseProject | null> {
    try {
      console.log('🏗️ [SupabaseProjectService] Creating project:', project.name);
      console.log('🏗️ [SupabaseProjectService] Project data:', project);

      const projectData = {
        ...project,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🏗️ [SupabaseProjectService] Inserting with data:', projectData);

      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      console.log('🏗️ [SupabaseProjectService] Insert response - Error:', error);
      console.log('🏗️ [SupabaseProjectService] Insert response - Data:', data);

      if (error) {
        console.error('❌ [SupabaseProjectService] Database error creating project:', error);
        console.error('❌ [SupabaseProjectService] Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ [SupabaseProjectService] Project created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ [SupabaseProjectService] Service error in createProject:', error);
      return null;
    }
  }

  // Method to create sample projects (for testing)
  static async createSampleProjects(userId: string): Promise<boolean> {
    try {
      console.log('🏗️ [SupabaseProjectService] Creating sample projects...');

      const sampleProjects = [
        {
          name: 'PromptWise AI Platform',
          description: 'Building an AI-powered platform for intelligent prompt engineering and optimization',
          status: 'in_progress' as const,
          progress: 65,
          tags: ['ai', 'platform', 'saas'],
          user_id: userId,
          start_date: '2024-01-15',
          end_date: '2024-12-31'
        },
        {
          name: 'Mobile App Redesign',
          description: 'Complete redesign of our mobile application with modern UI/UX principles',
          status: 'planning' as const,
          progress: 25,
          tags: ['mobile', 'ui-ux', 'redesign'],
          user_id: userId,
          start_date: '2024-11-01',
          end_date: '2024-03-15'
        },
        {
          name: 'E-commerce Integration',
          description: 'Integrate payment processing and inventory management systems',
          status: 'completed' as const,
          progress: 100,
          tags: ['ecommerce', 'payments', 'integration'],
          user_id: userId,
          start_date: '2024-08-01',
          end_date: '2024-10-30'
        }
      ];

      const results = [];
      for (const project of sampleProjects) {
        const result = await this.createProject(project);
        results.push(result);
        console.log('✅ Created project:', project.name);
      }

      console.log('🎉 [SupabaseProjectService] Created', results.filter(r => r).length, 'sample projects');
      return results.filter(r => r).length > 0;
    } catch (error) {
      console.error('❌ [SupabaseProjectService] Error creating sample projects:', error);
      return false;
    }
  }

  // Method to get absolutely all projects (for debugging)
  static async getAllProjectsDebug(): Promise<SupabaseProject[]> {
    try {
      console.log('🔧 [SupabaseProjectService] DEBUG: Getting ALL projects in database...');

      const { data, error } = await supabase
        .from('projects')
        .select('*');

      console.log('🔧 [SupabaseProjectService] DEBUG: Raw query result');
      console.log('🔧 [SupabaseProjectService] DEBUG: Error:', error);
      console.log('🔧 [SupabaseProjectService] DEBUG: Total projects in DB:', data?.length || 0);
      console.log('🔧 [SupabaseProjectService] DEBUG: Sample projects:', data?.slice(0, 3));

      return data || [];
    } catch (error) {
      console.error('🔧 [SupabaseProjectService] DEBUG: Error getting all projects:', error);
      return [];
    }
  }

  static async getProjects(userId?: string | null): Promise<SupabaseProject[]> {
    try {
      console.log('🔍 [SupabaseProjectService] Starting getProjects query...');
      console.log('🔍 [SupabaseProjectService] User ID provided:', userId);

      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // If userId is provided, filter by it, otherwise get projects with null user_id
      if (userId) {
        console.log('🔍 [SupabaseProjectService] Filtering by user_id:', userId);
        query = query.eq('user_id', userId);
      } else {
        console.log('🔍 [SupabaseProjectService] Getting projects with null user_id');
        query = query.is('user_id', null);
      }

      console.log('🔍 [SupabaseProjectService] Executing query...');
      const { data, error } = await query;

      console.log('🔍 [SupabaseProjectService] Query completed');
      console.log('🔍 [SupabaseProjectService] Error:', error);
      console.log('🔍 [SupabaseProjectService] Data:', data);
      console.log('🔍 [SupabaseProjectService] Data length:', data?.length || 0);

      if (error) {
        console.error('❌ [SupabaseProjectService] Database error:', error);
        throw error;
      }

      const result = data || [];
      console.log('✅ [SupabaseProjectService] Returning', result.length, 'projects');
      return result;
    } catch (error) {
      console.error('❌ [SupabaseProjectService] Service error:', error);
      return [];
    }
  }

  static async updateProject(id: string, updates: SupabaseProjectUpdate): Promise<SupabaseProject | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProject:', error);
      return null;
    }
  }

  static async deleteProject(id: string): Promise<boolean> {
    try {
      // First delete all tasks associated with this project
      await supabase
        .from('tasks')
        .delete()
        .eq('project_id', id);

      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      return false;
    }
  }

  // Task Methods
  static async createTask(task: SupabaseTaskInsert): Promise<SupabaseTask | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createTask:', error);
      return null;
    }
  }

  static async getTasks(projectId?: string): Promise<SupabaseTask[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  }

  static async updateTask(id: string, updates: SupabaseTaskUpdate): Promise<SupabaseTask | null> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If completing a task, set completed_at
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateTask:', error);
      return null;
    }
  }

  static async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return false;
    }
  }

  // Statistics and Analytics
  static async getProjectStats(userId?: string | null) {
    try {
      const projectsQuery = supabase
        .from('projects')
        .select('status');

      const tasksQuery = supabase
        .from('tasks')
        .select('status, project_id, projects!inner(user_id)');

      // Apply user filter if userId is provided
      if (userId) {
        projectsQuery.eq('user_id', userId);
        tasksQuery.eq('projects.user_id', userId);
      } else {
        projectsQuery.is('user_id', null);
        tasksQuery.is('projects.user_id', null);
      }

      const [projectsResponse, tasksResponse] = await Promise.all([
        projectsQuery,
        tasksQuery
      ]);

      const projects = projectsResponse.data || [];
      const tasks = tasksResponse.data || [];

      return {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in_progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status !== 'completed').length,
      };
    } catch (error) {
      console.error('Error in getProjectStats:', error);
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      };
    }
  }
}