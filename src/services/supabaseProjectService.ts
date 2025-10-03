import { supabase } from '../lib/supabase';

export interface SupabaseProject {
  id?: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  tags?: string[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseTask {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: string;
  due_date?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class SupabaseProjectService {
  // Project Methods
  static async createProject(project: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseProject | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Project created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProject:', error);
      return null;
    }
  }

  static async getProjects(userId: string): Promise<SupabaseProject[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProjects:', error);
      return [];
    }
  }

  static async updateProject(id: string, updates: Partial<SupabaseProject>): Promise<SupabaseProject | null> {
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
  static async createTask(task: Omit<SupabaseTask, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseTask | null> {
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

  static async updateTask(id: string, updates: Partial<SupabaseTask>): Promise<SupabaseTask | null> {
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
  static async getProjectStats(userId: string) {
    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        supabase
          .from('projects')
          .select('status')
          .eq('user_id', userId),

        supabase
          .from('tasks')
          .select('status, project_id, projects!inner(user_id)')
          .eq('projects.user_id', userId)
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