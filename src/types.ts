// Core type definitions for the Project Planner App
// This file provides type definitions that bridge database types with component interfaces

import type { Database } from './lib/database.types';

// Core Project type - maps to database Row but with adjusted property names
export interface Project {
  id: string;
  title: string; // Maps to "name" in database
  description: string | null;
  start_date: string | null;
  due_date: string | null; // Maps to "end_date" in database
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  team_members: string[] | null;
  ai_generated: boolean | null;
  metadata?: {
    template?: string;
    priority?: 'low' | 'medium' | 'high';
    created_via?: string;
    context?: any;
    success_score?: number | null;
  };
}

// Project insert type for creating new projects
export interface ProjectInsert {
  id?: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  status?: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress?: number;
  tags?: string[] | null;
  user_id?: string | null;
  team_members?: string[] | null;
  ai_generated?: boolean | null;
  metadata?: {
    template?: string;
    priority?: 'low' | 'medium' | 'high';
    created_via?: string;
    context?: any;
    success_score?: number | null;
  };
}

// Project update type for modifying existing projects
export interface ProjectUpdate {
  id?: string;
  title?: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  status?: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress?: number;
  tags?: string[] | null;
  user_id?: string | null;
  team_members?: string[] | null;
  ai_generated?: boolean | null;
  metadata?: {
    template?: string;
    priority?: 'low' | 'medium' | 'high';
    created_via?: string;
    context?: any;
    success_score?: number | null;
  };
}

// Task type - maps to database task structure
export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  ai_suggested: boolean | null;
  order_index: number | null;
  assigned_to: string | null;
  completed_at: string | null;
}

// Task insert type
export interface TaskInsert {
  id?: string;
  project_id: string;
  name: string;
  description?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  completed?: boolean;
  user_id?: string | null;
  ai_suggested?: boolean | null;
  order_index?: number | null;
  assigned_to?: string | null;
}

// Task update type
export interface TaskUpdate {
  id?: string;
  project_id?: string;
  name?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  completed?: boolean;
  user_id?: string | null;
  ai_suggested?: boolean | null;
  order_index?: number | null;
  assigned_to?: string | null;
  completed_at?: string | null;
}

// User type - simplified for auth context
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: Error | null;
  success: boolean;
  message?: string;
}

// Component prop types
export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Form types for project creation
export interface ProjectFormData {
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  tags: string[];
  start_date: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  template: string;
}

// Export database types for advanced usage
export type {
  Database,
  Json
} from './lib/database.types';

// Re-export commonly used database types
export type DbProject = Database['public']['Tables']['projects']['Row'];
export type DbProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type DbProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type DbTask = Database['public']['Tables']['tasks']['Row'];
export type DbTaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type DbTaskUpdate = Database['public']['Tables']['tasks']['Update'];