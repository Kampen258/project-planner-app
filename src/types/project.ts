// AI Analysis Types
export interface ProgressUpdate {
  step: 'reading' | 'analyzing' | 'complete' | 'error';
  message: string;
  detail: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  priority: 'high' | 'medium' | 'low';
  impact_on_success_score: number;
}

// Project Context Types
export interface ProjectContext {
  goals_and_objectives: {
    primary_goal: string;
    key_objectives: string[];
    definition_of_done: string;
    success_criteria: string[];
  };
  target_audience: {
    primary_audience: string;
    user_personas: string[];
    problem_solved: string;
  };
  budget_and_resources: {
    budget_amount: number;
    budget_currency: string;
    team_size: number;
    available_resources: string[];
  };
  success_criteria_kpis: {
    metrics: string[];
    targets: Record<string, number>;
  };
  external_resources: {
    apis: string[];
    services: string[];
    dependencies: string[];
  };
  background_history: {
    context: string;
    previous_attempts: string[];
    lessons_learned: string[];
  };
  stakeholders: {
    primary: string[];
    secondary: string[];
    decision_makers: string[];
  };
  risks_and_concerns: {
    technical_risks: string[];
    business_risks: string[];
    mitigation_strategies: string[];
  };
  timeline?: {
    start_date: string;
    end_date: string;
    duration: string;
    phases: {
      name: string;
      duration: string;
    }[];
  };
}

// Analysis Results Types
export interface ProjectExtraction {
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
    feature: string;
    phase: string;
    priority: 'low' | 'medium' | 'high';
    estimated_effort: string;
  }[];
}

export interface AnalysisResults {
  extraction: ProjectExtraction;
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