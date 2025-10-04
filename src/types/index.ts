// Unified Types for Project Planner App

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_tier: 'free' | 'pro';
  subscription_status: 'active' | 'inactive' | 'trial';
  subscription_start_date?: string;
  subscription_end_date?: string;
  stripe_customer_id?: string;
  profile_data?: Record<string, any>;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number; // 0-100
  start_date?: string;
  due_date?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  team_members?: string[];
  ai_generated: boolean;
  metadata?: Record<string, any>;
  
  // Project Context from AI Interview
  context?: ProjectContext;
  success_score?: number;
}

export interface ProjectContext {
  goals_and_objectives?: {
    primary_goal?: string;
    key_objectives?: string[];
    definition_of_done?: string;
    success_criteria?: string[];
  };
  target_audience?: {
    primary_audience?: string;
    user_personas?: string[];
    problem_solved?: string;
  };
  budget_and_resources?: {
    budget_amount?: number;
    budget_currency?: string;
    team_size?: number;
    available_resources?: string[];
  };
  success_criteria_kpis?: {
    key_metrics?: string[];
    target_values?: Record<string, string>;
  };
  external_resources?: {
    links?: string[];
    documentation?: string[];
    references?: string[];
  };
  background_history?: {
    background?: string;
    previous_attempts?: string[];
    lessons_learned?: string[];
  };
  stakeholders?: {
    decision_makers?: string[];
    key_stakeholders?: string[];
    communication_plan?: string;
  };
  risks_and_concerns?: {
    identified_risks?: string[];
    mitigation_strategies?: Record<string, string>;
    blockers?: string[];
  };
}

export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  ai_suggested: boolean;
  order_index: number;
}

// AI Interview types
export interface InterviewQuestion {
  id: string;
  category: keyof ProjectContext;
  question: string;
  follow_up?: string;
  priority: 'high' | 'medium' | 'low';
  impact_on_success_score: number;
}

export interface InterviewAnswer {
  question_id: string;
  category: keyof ProjectContext;
  answer: string;
  timestamp: string;
}

export interface InterviewSession {
  id: string;
  project_id?: string;
  user_id: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  current_question_index: number;
  initial_score: number;
  current_score: number;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

// Project Creation Flow types
export type CreationStep = 
  | 'initial'           // Choose upload or scratch
  | 'upload'            // File upload interface
  | 'analyzing'         // AI analyzing document
  | 'results'           // Show analysis results
  | 'review'            // Review all extracted info
  | 'interview'         // AI interview for missing info
  | 'summary'           // Final summary
  | 'organization'      // Choose task organization
  | 'complete';         // Project created

export interface ProjectCreationState {
  step: CreationStep;
  method: 'upload' | 'scratch' | null;
  uploadedFile?: File;
  analysisResults?: AnalysisResults;
  interviewSession?: InterviewSession;
  projectData: Partial<Project>;
  taskOrganization?: 'by-feature' | 'by-phase' | 'flat-tags';
}

export interface AnalysisResults {
  extraction: {
    project: {
      title: string;
      description: string;
      type: string;
    };
    context: Partial<ProjectContext>;
    features: {
      name: string;
      description: string;
      task_count: number;
    }[];
    tasks: {
      title: string;
      description: string;
      feature?: string;
      phase?: string;
      priority: string;
      estimated_effort?: string;
    }[];
    timeline?: {
      start_date?: string;
      end_date?: string;
      duration?: string;
      phases?: {
        name: string;
        duration: string;
      }[];
    };
  };
  completeness: {
    overall_score: number;
    complete_categories: string[];
    incomplete_categories: string[];
    questions_needed: number;
  };
  metadata: {
    word_count: number;
    analysis_duration: number;
    ai_model: string;
    tokens_used: number;
  };
}

export interface ProgressUpdate {
  step: string;
  message: string;
  detail?: string;
}

// Legacy compatibility types (for gradual migration)
export interface LegacyProject {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: string;
  progress: number;
  tags?: string[];
  created?: string;
  updated?: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

// Team types
export interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joined_at: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface TeamActivity {
  id: string;
  user_id: string;
  project_id: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Database Schema Types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'joined_at'>;
        Update: Partial<Omit<TeamMember, 'id'>>;
      };
      team_activities: {
        Row: TeamActivity;
        Insert: Omit<TeamActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<TeamActivity, 'id'>>;
      };
      interview_sessions: {
        Row: InterviewSession;
        Insert: Omit<InterviewSession, 'id' | 'created_at'>;
        Update: Partial<Omit<InterviewSession, 'id' | 'created_at'>>;
      };
    };
  };
}