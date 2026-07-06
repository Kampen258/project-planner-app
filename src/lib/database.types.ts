// This file contains TypeScript types for the Supabase database schema
// Generated based on the current database structure with advanced Supabase patterns

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          progress: number
          tags: string[] | null
          created_at: string
          updated_at: string
          user_id: string | null
          team_members: string[] | null
          ai_generated: boolean | null
          context: Json | null
          success_score: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          progress?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
          team_members?: string[] | null
          ai_generated?: boolean | null
          context?: Json | null
          success_score?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          progress?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
          team_members?: string[] | null
          ai_generated?: boolean | null
          context?: Json | null
          success_score?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
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
          user_id: string | null
          ai_suggested: boolean | null
          order_index: number | null
          assigned_to: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          completed?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string | null
          ai_suggested?: boolean | null
          order_index?: number | null
          assigned_to?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          completed?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string | null
          ai_suggested?: boolean | null
          order_index?: number | null
          assigned_to?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string | null
          subscription_tier: string | null
          subscription_status: string | null
          subscription_start_date: string | null
          subscription_end_date: string | null
          stripe_customer_id: string | null
          profile_data: Json | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          profile_data?: Json | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          profile_data?: Json | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          user_id: string | null
          project_id: string | null
          role: string | null
          permissions: string[] | null
          joined_at: string | null
          status: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          role?: string | null
          permissions?: string[] | null
          joined_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          role?: string | null
          permissions?: string[] | null
          joined_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      team_activities: {
        Row: {
          id: string
          user_id: string | null
          project_id: string | null
          action: string
          description: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          action: string
          description?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          action?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          id: string
          project_id: string | null
          user_id: string | null
          questions: Json
          answers: Json | null
          current_question_index: number | null
          initial_score: number | null
          current_score: number | null
          completed: boolean | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          questions: Json
          answers?: Json | null
          current_question_index?: number | null
          initial_score?: number | null
          current_score?: number | null
          completed?: boolean | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          questions?: Json
          answers?: Json | null
          current_question_index?: number | null
          initial_score?: number | null
          current_score?: number | null
          completed?: boolean | null
          created_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'user' | 'moderator'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'user' | 'moderator'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'user' | 'moderator'
          created_at?: string
        }
        Relationships: []
      }
      // Discovery-track tables (Sprint 2). Hand-authored to match
      // database/migrations/add_discovery_system.sql — regenerate this whole
      // file with `npm run db:generate-types` after applying the migration.
      opportunities: {
        Row: {
          id: string
          project_id: string
          title: string
          problem_statement: string | null
          affected_users: string | null
          current_state: string | null
          desired_outcome: string | null
          success_metrics: string | null
          evidence: string | null
          assumptions: string | null
          confidence: number | null
          effort: 'S' | 'M' | 'L' | null
          risk: 'low' | 'medium' | 'high' | null
          cost_of_delay: 'low' | 'medium' | 'high' | null
          status: 'backlog' | 'researching' | 'validated' | 'archived'
          objective_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          problem_statement?: string | null
          affected_users?: string | null
          current_state?: string | null
          desired_outcome?: string | null
          success_metrics?: string | null
          evidence?: string | null
          assumptions?: string | null
          confidence?: number | null
          effort?: 'S' | 'M' | 'L' | null
          risk?: 'low' | 'medium' | 'high' | null
          cost_of_delay?: 'low' | 'medium' | 'high' | null
          status?: 'backlog' | 'researching' | 'validated' | 'archived'
          objective_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          problem_statement?: string | null
          affected_users?: string | null
          current_state?: string | null
          desired_outcome?: string | null
          success_metrics?: string | null
          evidence?: string | null
          assumptions?: string | null
          confidence?: number | null
          effort?: 'S' | 'M' | 'L' | null
          risk?: 'low' | 'medium' | 'high' | null
          cost_of_delay?: 'low' | 'medium' | 'high' | null
          status?: 'backlog' | 'researching' | 'validated' | 'archived'
          objective_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      hypotheses: {
        Row: {
          id: string
          project_id: string
          opportunity_id: string | null
          title: string
          hypothesis_statement: string | null
          assumptions: Json
          test_method: string | null
          success_criteria: string | null
          scale_threshold: string | null
          iterate_threshold: string | null
          kill_threshold: string | null
          resources_needed: Json
          status: 'draft' | 'in_test' | 'learning' | 'scaled' | 'killed' | 'archived'
          experiment_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          opportunity_id?: string | null
          title: string
          hypothesis_statement?: string | null
          assumptions?: Json
          test_method?: string | null
          success_criteria?: string | null
          scale_threshold?: string | null
          iterate_threshold?: string | null
          kill_threshold?: string | null
          resources_needed?: Json
          status?: 'draft' | 'in_test' | 'learning' | 'scaled' | 'killed' | 'archived'
          experiment_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          opportunity_id?: string | null
          title?: string
          hypothesis_statement?: string | null
          assumptions?: Json
          test_method?: string | null
          success_criteria?: string | null
          scale_threshold?: string | null
          iterate_threshold?: string | null
          kill_threshold?: string | null
          resources_needed?: Json
          status?: 'draft' | 'in_test' | 'learning' | 'scaled' | 'killed' | 'archived'
          experiment_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      experiments: {
        Row: {
          id: string
          project_id: string
          hypothesis_id: string | null
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          participants: number
          method: 'ab_test' | 'prototype' | 'concierge' | 'interview' | 'analytics' | 'survey' | null
          success_metrics: Json
          status: 'planned' | 'running' | 'completed' | 'cancelled'
          results: string
          decision: 'scale' | 'iterate' | 'kill' | 'pending'
          next_steps: string
          insights: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          hypothesis_id?: string | null
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          participants?: number
          method?: 'ab_test' | 'prototype' | 'concierge' | 'interview' | 'analytics' | 'survey' | null
          success_metrics?: Json
          status?: 'planned' | 'running' | 'completed' | 'cancelled'
          results?: string
          decision?: 'scale' | 'iterate' | 'kill' | 'pending'
          next_steps?: string
          insights?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          hypothesis_id?: string | null
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          participants?: number
          method?: 'ab_test' | 'prototype' | 'concierge' | 'interview' | 'analytics' | 'survey' | null
          success_metrics?: Json
          status?: 'planned' | 'running' | 'completed' | 'cancelled'
          results?: string
          decision?: 'scale' | 'iterate' | 'kill' | 'pending'
          next_steps?: string
          insights?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          category: 'interviews' | 'usability_tests' | 'analytics' | 'surveys' | 'other' | null
          source: string | null
          evidence: Json
          impact_level: 'low' | 'medium' | 'high'
          actionable: boolean
          tags: Json
          linked_opportunities: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          category?: 'interviews' | 'usability_tests' | 'analytics' | 'surveys' | 'other' | null
          source?: string | null
          evidence?: Json
          impact_level?: 'low' | 'medium' | 'high'
          actionable?: boolean
          tags?: Json
          linked_opportunities?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          category?: 'interviews' | 'usability_tests' | 'analytics' | 'surveys' | 'other' | null
          source?: string | null
          evidence?: Json
          impact_level?: 'low' | 'medium' | 'high'
          actionable?: boolean
          tags?: Json
          linked_opportunities?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'ready' | 'in_progress' | 'review' | 'released' | 'measuring'
          priority: 'low' | 'medium' | 'high'
          effort: 'S' | 'M' | 'L' | null
          assignee: string | null
          phase_id: string | null
          experiment_reference: string | null
          hypothesis_reference: string | null
          acceptance_criteria: Json
          definition_of_ready: Json
          definition_of_done: Json
          started_at: string | null
          completed_at: string | null
          cycle_time: number | null
          blocked: boolean
          blocked_reason: string | null
          tags: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'ready' | 'in_progress' | 'review' | 'released' | 'measuring'
          priority?: 'low' | 'medium' | 'high'
          effort?: 'S' | 'M' | 'L' | null
          assignee?: string | null
          phase_id?: string | null
          experiment_reference?: string | null
          hypothesis_reference?: string | null
          acceptance_criteria?: Json
          definition_of_ready?: Json
          definition_of_done?: Json
          started_at?: string | null
          completed_at?: string | null
          cycle_time?: number | null
          blocked?: boolean
          blocked_reason?: string | null
          tags?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'ready' | 'in_progress' | 'review' | 'released' | 'measuring'
          priority?: 'low' | 'medium' | 'high'
          effort?: 'S' | 'M' | 'L' | null
          assignee?: string | null
          phase_id?: string | null
          experiment_reference?: string | null
          hypothesis_reference?: string | null
          acceptance_criteria?: Json
          definition_of_ready?: Json
          definition_of_done?: Json
          started_at?: string | null
          completed_at?: string | null
          cycle_time?: number | null
          blocked?: boolean
          blocked_reason?: string | null
          tags?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
      task_status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
      user_role: 'owner' | 'admin' | 'member' | 'viewer'
      role_type: 'admin' | 'user' | 'moderator'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_status: ["planning", "in_progress", "completed", "on_hold"],
      task_status: ["todo", "in_progress", "completed", "cancelled"],
      task_priority: ["low", "medium", "high", "urgent"],
      user_role: ["owner", "admin", "member", "viewer"],
      role_type: ["admin", "user", "moderator"],
    },
  },
} as const

// Convenience type aliases for easier usage
export type Project = Tables<"projects">
export type ProjectInsert = TablesInsert<"projects">
export type ProjectUpdate = TablesUpdate<"projects">

export type Task = Tables<"tasks">
export type TaskInsert = TablesInsert<"tasks">
export type TaskUpdate = TablesUpdate<"tasks">

export type User = Tables<"users">
export type UserInsert = TablesInsert<"users">
export type UserUpdate = TablesUpdate<"users">

export type TeamMember = Tables<"team_members">
export type TeamMemberInsert = TablesInsert<"team_members">
export type TeamMemberUpdate = TablesUpdate<"team_members">

export type UserRole = Tables<"user_roles">
export type UserRoleInsert = TablesInsert<"user_roles">
export type UserRoleUpdate = TablesUpdate<"user_roles">