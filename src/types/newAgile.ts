// New Agile Methodology Types
// Outcome-driven, discovery-led project management

export type OpportunityStatus = 'backlog' | 'researching' | 'validated' | 'archived';
export type HypothesisStatus = 'draft' | 'in_test' | 'learning' | 'scaled' | 'killed' | 'archived';
export type ExperimentStatus = 'planned' | 'running' | 'completed' | 'cancelled';
export type DeliveryTaskStatus = 'ready' | 'in_progress' | 'review' | 'released' | 'measuring';
export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type EffortEstimate = 'S' | 'M' | 'L';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CostOfDelay = 'low' | 'medium' | 'high';
export type InsightCategory = 'interviews' | 'usability_tests' | 'analytics' | 'surveys' | 'other';

// Opportunity (Problem worth solving)
export interface Opportunity {
  id: string;
  title: string;
  problem_statement: string;
  affected_users: string;
  evidence: string[];
  expected_impact: string;
  constraints: string[];
  cost_of_delay: CostOfDelay;
  confidence: ConfidenceLevel;
  effort: EffortEstimate;
  risk: RiskLevel;
  status: OpportunityStatus;
  objective_id?: string; // Link to OKR
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Hypothesis (Potential solution)
export interface Hypothesis {
  id: string;
  opportunity_id: string;
  title: string;
  hypothesis_statement: string; // "If we [change], then [users] will [behavior], measured by [metric]"
  assumptions: string[];
  test_method: string;
  success_criteria: string;
  scale_threshold: string;
  iterate_threshold: string;
  kill_threshold: string;
  resources_needed: {
    time: string;
    people: string[];
    tools: string[];
  };
  status: HypothesisStatus;
  experiment_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Experiment (Small test to validate)
export interface Experiment {
  id: string;
  hypothesis_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  participants: number;
  method: 'ab_test' | 'prototype' | 'concierge' | 'interview' | 'analytics' | 'survey';
  success_metrics: {
    metric: string;
    baseline: number;
    target: number;
    actual?: number;
  }[];
  status: ExperimentStatus;
  results: string;
  decision: 'scale' | 'iterate' | 'kill' | 'pending';
  next_steps: string;
  insights: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Insight (Learning from discovery work)
export interface Insight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  source: string; // Where it came from (experiment, interview, etc.)
  evidence: string[];
  impact_level: 'low' | 'medium' | 'high';
  actionable: boolean;
  tags: string[];
  linked_opportunities: string[]; // IDs of related opportunities
  created_at: string;
  updated_at: string;
  created_by: string;
}

// OKR (Objectives & Key Results)
export interface Objective {
  id: string;
  title: string;
  description: string;
  quarter: string;
  owner: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  confidence: ConfidenceLevel;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description: string;
  metric: string;
  baseline: number;
  target: number;
  current_value: number;
  unit: string;
  measurement_frequency: 'daily' | 'weekly' | 'monthly';
  last_updated: string;
  owner: string;
  status: 'not_started' | 'at_risk' | 'on_track' | 'completed';
  confidence: ConfidenceLevel;
  created_at: string;
  updated_at: string;
}

// Phase (Project phases containing multiple tasks)
export interface Phase {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: PhaseStatus;
  order: number; // Phase ordering within project
  start_date?: string;
  end_date?: string;
  estimated_duration_weeks?: number;
  progress_percentage: number; // 0-100 calculated from task completion
  task_count: number; // Total tasks in this phase
  completed_task_count: number; // Completed tasks in this phase
  color?: string; // UI color theme for the phase
  dependencies?: string[]; // IDs of phases that must complete first
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Delivery Task (Implementation work)
export interface DeliveryTask {
  id: string;
  title: string;
  description: string;
  status: DeliveryTaskStatus;
  priority: 'low' | 'medium' | 'high';
  effort: EffortEstimate;
  assignee?: string;
  phase_id?: string; // Link to containing phase
  experiment_reference?: string; // Link to supporting experiment
  hypothesis_reference?: string; // Link to supporting hypothesis
  acceptance_criteria: string[];
  definition_of_ready: string[];
  definition_of_done: string[];
  started_at?: string;
  completed_at?: string;
  cycle_time?: number; // Hours from start to done
  blocked: boolean;
  blocked_reason?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Decision Log Entry
export interface Decision {
  id: string;
  title: string;
  context: string;
  options_considered: {
    option: string;
    pros: string[];
    cons: string[];
  }[];
  decision: string;
  rationale: string;
  evidence: string[];
  owner: string;
  stakeholders: string[];
  success_criteria: string[];
  review_date?: string;
  outcome?: string;
  lessons_learned?: string;
  created_at: string;
  updated_at: string;
}

// User Personas
export interface UserPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  needs: string[];
  pain_points: string[];
  goals: string[];
  behaviors: string[];
  demographics?: {
    age_range?: string;
    location?: string;
    occupation?: string;
    experience_level?: string;
  };
  created_at: string;
  updated_at: string;
}

// WIP Limits for Kanban
export interface WIPLimits {
  ready: number;
  in_progress: number;
  review: number;
  released?: number;
  measuring?: number;
}

// Flow Metrics
export interface FlowMetrics {
  total_wip: number;
  aging_items: number; // Items older than threshold
  cycle_time_avg: number; // Average hours from start to done
  lead_time_avg: number; // Average hours from creation to done
  throughput_weekly: number; // Items completed per week
  blocked_items: number;
}

// New Agile Project Configuration
export interface NewAgileProject {
  id: string;
  name: string;
  description: string;
  objectives: Objective[];
  wip_limits: WIPLimits;
  team_members: string[];
  cadence: {
    discovery_sync_day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    outcome_review_frequency: 'weekly' | 'monthly';
    retrospective_frequency: 'monthly' | 'quarterly';
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

// API Response Types
export interface OpportunityCreateRequest {
  title: string;
  problem_statement: string;
  affected_users: string;
  evidence: string[];
  expected_impact: string;
  constraints: string[];
  cost_of_delay: CostOfDelay;
  confidence: ConfidenceLevel;
  effort: EffortEstimate;
  risk: RiskLevel;
  objective_id?: string;
}

export interface HypothesisCreateRequest {
  opportunity_id: string;
  title: string;
  hypothesis_statement: string;
  assumptions: string[];
  test_method: string;
  success_criteria: string;
  scale_threshold: string;
  iterate_threshold: string;
  kill_threshold: string;
  resources_needed: {
    time: string;
    people: string[];
    tools: string[];
  };
}

export interface ExperimentCreateRequest {
  hypothesis_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  participants: number;
  method: 'ab_test' | 'prototype' | 'concierge' | 'interview' | 'analytics' | 'survey';
  success_metrics: {
    metric: string;
    baseline: number;
    target: number;
  }[];
}

export interface DeliveryTaskCreateRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  effort: EffortEstimate;
  assignee?: string;
  phase_id?: string;
  experiment_reference?: string;
  hypothesis_reference?: string;
  acceptance_criteria: string[];
  tags: string[];
}

export interface PhaseCreateRequest {
  name: string;
  description: string;
  order: number;
  start_date?: string;
  end_date?: string;
  estimated_duration_weeks?: number;
  color?: string;
  dependencies?: string[];
}

// Dashboard/Overview Types
export interface NewAgileDashboard {
  opportunities: {
    total: number;
    by_status: Record<OpportunityStatus, number>;
    high_value_count: number;
  };
  experiments: {
    total: number;
    running: number;
    completed_this_month: number;
    win_rate: number; // Percentage that scaled
  };
  delivery: {
    wip: FlowMetrics;
    recently_released: DeliveryTask[];
    blocked_items: DeliveryTask[];
  };
  okr_progress: {
    objectives_on_track: number;
    total_objectives: number;
    key_results: {
      completed: number;
      at_risk: number;
      total: number;
    };
  };
}