// OKR Service - Database operations for Objectives & Key Results
// Implements New Agile methodology OKR management

import { supabase } from '../../lib/supabase';
import type {
  Objective,
  ObjectiveInsert,
  ObjectiveUpdate,
  KeyResult,
  KeyResultInsert,
  KeyResultUpdate as KeyResultUpdateType,
  KeyResultUpdateInsert,
  OKRProgressSummary
} from '../../types';

// Objective CRUD operations
export const objectiveService = {
  // Get all objectives for current user
  async getObjectives(quarter?: number, year?: number): Promise<Objective[]> {
    let query = supabase
      .from('objectives')
      .select(`
        *,
        key_results (
          *,
          key_result_updates (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (quarter) query = query.eq('quarter', quarter);
    if (year) query = query.eq('year', year);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get single objective by ID
  async getObjective(id: string): Promise<Objective | null> {
    const { data, error } = await supabase
      .from('objectives')
      .select(`
        *,
        key_results (
          *,
          key_result_updates (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new objective
  async createObjective(objective: ObjectiveInsert): Promise<Objective> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const objectiveData = {
      ...objective,
      owner_id: user.user.id
    };

    const { data, error } = await supabase
      .from('objectives')
      .insert(objectiveData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update existing objective
  async updateObjective(id: string, updates: ObjectiveUpdate): Promise<Objective> {
    const { data, error } = await supabase
      .from('objectives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete objective
  async deleteObjective(id: string): Promise<void> {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get objectives linked to a project
  async getProjectObjectives(projectId: string): Promise<Objective[]> {
    const { data, error } = await supabase
      .from('objectives')
      .select(`
        *,
        key_results (*)
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  }
};

// Key Result CRUD operations
export const keyResultService = {
  // Get key results for an objective
  async getKeyResults(objectiveId: string): Promise<KeyResult[]> {
    const { data, error } = await supabase
      .from('key_results')
      .select(`
        *,
        key_result_updates (*)
      `)
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get single key result by ID
  async getKeyResult(id: string): Promise<KeyResult | null> {
    const { data, error } = await supabase
      .from('key_results')
      .select(`
        *,
        key_result_updates (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new key result
  async createKeyResult(keyResult: KeyResultInsert): Promise<KeyResult> {
    const { data, error } = await supabase
      .from('key_results')
      .insert(keyResult)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update existing key result
  async updateKeyResult(id: string, updates: KeyResultUpdateType): Promise<KeyResult> {
    const { data, error } = await supabase
      .from('key_results')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete key result
  async deleteKeyResult(id: string): Promise<void> {
    const { error } = await supabase
      .from('key_results')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add progress update to key result
  async addKeyResultUpdate(update: KeyResultUpdateInsert): Promise<void> {
    const { error } = await supabase
      .from('key_result_updates')
      .insert(update);

    if (error) throw error;
  },

  // Get progress history for key result
  async getKeyResultUpdates(keyResultId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('key_result_updates')
      .select('*')
      .eq('key_result_id', keyResultId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};

// OKR Analytics and Progress Tracking
export const okrAnalyticsService = {
  // Get OKR progress summary
  async getOKRProgressSummary(quarter?: number, year?: number): Promise<OKRProgressSummary[]> {
    let query = supabase
      .from('okr_progress_summary')
      .select('*');

    if (quarter) query = query.eq('quarter', quarter);
    if (year) query = query.eq('year', year);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Calculate objective progress percentage
  calculateObjectiveProgress(objective: Objective): number {
    if (!objective.key_results || objective.key_results.length === 0) {
      return 0;
    }

    const totalProgress = objective.key_results.reduce((sum, kr) => {
      const progress = kr.target !== 0 ? (kr.current_value / kr.target) * 100 : 0;
      return sum + Math.min(progress, 100); // Cap at 100%
    }, 0);

    return Math.round(totalProgress / objective.key_results.length);
  },

  // Get objectives at risk (< 50% progress with < 30 days left in quarter)
  async getObjectivesAtRisk(): Promise<Objective[]> {
    const objectives = await objectiveService.getObjectives();
    const now = new Date();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();

    return objectives.filter(obj => {
      if (obj.quarter !== currentQuarter || obj.year !== currentYear) return false;

      const progress = this.calculateObjectiveProgress(obj);
      const quarterEnd = new Date(currentYear, currentQuarter * 3 - 1, 0); // Last day of quarter
      const daysLeft = Math.ceil((quarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return progress < 50 && daysLeft < 30;
    });
  },

  // Get current quarter OKRs
  getCurrentQuarterOKRs(): Promise<Objective[]> {
    const now = new Date();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3) as 1 | 2 | 3 | 4;
    const currentYear = now.getFullYear();

    return objectiveService.getObjectives(currentQuarter, currentYear);
  },

  // Generate OKR health report
  async generateHealthReport() {
    const objectives = await this.getCurrentQuarterOKRs();
    const atRisk = await this.getObjectivesAtRisk();

    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(obj => obj.status === 'completed').length;
    const averageProgress = objectives.length > 0
      ? objectives.reduce((sum, obj) => sum + this.calculateObjectiveProgress(obj), 0) / objectives.length
      : 0;

    const totalKeyResults = objectives.reduce((sum, obj) => sum + (obj.key_results?.length || 0), 0);
    const completedKeyResults = objectives.reduce((sum, obj) =>
      sum + (obj.key_results?.filter(kr => kr.status === 'completed').length || 0), 0);

    return {
      totalObjectives,
      completedObjectives,
      objectivesAtRisk: atRisk.length,
      averageProgress: Math.round(averageProgress),
      totalKeyResults,
      completedKeyResults,
      keyResultCompletionRate: totalKeyResults > 0 ? Math.round((completedKeyResults / totalKeyResults) * 100) : 0
    };
  }
};

// Utility functions
export const okrUtils = {
  // Get current quarter
  getCurrentQuarter(): 1 | 2 | 3 | 4 {
    const month = new Date().getMonth() + 1;
    return Math.ceil(month / 3) as 1 | 2 | 3 | 4;
  },

  // Get current year
  getCurrentYear(): number {
    return new Date().getFullYear();
  },

  // Format progress as percentage
  formatProgress(current: number, target: number): string {
    if (target === 0) return '0%';
    const percentage = Math.min((current / target) * 100, 100);
    return `${Math.round(percentage)}%`;
  },

  // Get quarter name
  getQuarterName(quarter: number): string {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters[quarter - 1] || 'Q1';
  },

  // Get quarter date range
  getQuarterDateRange(quarter: number, year: number): { start: Date; end: Date } {
    const start = new Date(year, (quarter - 1) * 3, 1);
    const end = new Date(year, quarter * 3, 0); // Last day of the quarter
    return { start, end };
  },

  // Check if objective is overdue
  isObjectiveOverdue(objective: Objective): boolean {
    const now = new Date();
    const { end } = this.getQuarterDateRange(objective.quarter, objective.year);
    return now > end && objective.status !== 'completed';
  }
};

// Export all services
export {
  objectiveService,
  keyResultService,
  okrAnalyticsService,
  okrUtils
};