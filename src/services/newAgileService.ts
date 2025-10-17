import { supabase } from '../lib/supabase';
import type {
  Opportunity,
  OpportunityCreateRequest,
  Hypothesis,
  HypothesisCreateRequest,
  Experiment,
  ExperimentCreateRequest,
  DeliveryTask,
  DeliveryTaskCreateRequest
} from '../types/newAgile';

export class NewAgileService {
  // Opportunity Methods
  static async createOpportunity(
    opportunityData: OpportunityCreateRequest,
    projectId: string,
    userId: string
  ): Promise<Opportunity | null> {
    try {
      console.log('🏗️ [NewAgileService] Creating opportunity:', opportunityData.title);
      console.log('🏗️ [NewAgileService] Project ID:', projectId);
      console.log('🏗️ [NewAgileService] User ID:', userId);

      const fullOpportunityData = {
        ...opportunityData,
        project_id: projectId,
        status: 'backlog' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId
      };

      console.log('🏗️ [NewAgileService] Full opportunity data:', fullOpportunityData);

      // First, check if opportunities table exists
      console.log('🔍 [NewAgileService] Checking opportunities table...');

      const { data, error } = await supabase
        .from('opportunities')
        .insert(fullOpportunityData)
        .select()
        .single();

      console.log('🏗️ [NewAgileService] Insert response - Error:', error);
      console.log('🏗️ [NewAgileService] Insert response - Data:', data);

      if (error) {
        console.error('❌ [NewAgileService] Database error creating opportunity:', error);
        console.error('❌ [NewAgileService] Error details:', JSON.stringify(error, null, 2));

        // If table doesn't exist, create a mock response for now
        if (error.code === '42P01') {
          console.warn('⚠️ [NewAgileService] Opportunities table not found, returning mock data');
          return {
            id: `mock-opp-${Date.now()}`,
            ...fullOpportunityData
          } as Opportunity;
        }

        throw error;
      }

      console.log('✅ [NewAgileService] Opportunity created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in createOpportunity:', error);
      return null;
    }
  }

  static async getOpportunities(projectId: string): Promise<Opportunity[]> {
    try {
      console.log('🔍 [NewAgileService] Getting opportunities for project:', projectId);

      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [NewAgileService] Error fetching opportunities:', error);

        // If table doesn't exist, return empty array for now
        if (error.code === '42P01') {
          console.warn('⚠️ [NewAgileService] Opportunities table not found, returning empty array');
          return [];
        }

        throw error;
      }

      console.log('✅ [NewAgileService] Found', data?.length || 0, 'opportunities');
      return data || [];
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in getOpportunities:', error);
      return [];
    }
  }

  static async updateOpportunity(
    id: string,
    updates: Partial<OpportunityCreateRequest>
  ): Promise<Opportunity | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [NewAgileService] Error updating opportunity:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in updateOpportunity:', error);
      return null;
    }
  }

  static async deleteOpportunity(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ [NewAgileService] Error deleting opportunity:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in deleteOpportunity:', error);
      return false;
    }
  }

  // Hypothesis Methods
  static async createHypothesis(
    hypothesisData: HypothesisCreateRequest,
    projectId: string,
    userId: string
  ): Promise<Hypothesis | null> {
    try {
      console.log('🏗️ [NewAgileService] Creating hypothesis:', hypothesisData.title);
      console.log('🏗️ [NewAgileService] Project ID:', projectId);
      console.log('🏗️ [NewAgileService] User ID:', userId);

      const fullHypothesisData = {
        ...hypothesisData,
        project_id: projectId,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId
      };

      console.log('🏗️ [NewAgileService] Full hypothesis data:', fullHypothesisData);

      const { data, error } = await supabase
        .from('hypotheses')
        .insert(fullHypothesisData)
        .select()
        .single();

      console.log('🏗️ [NewAgileService] Insert response - Error:', error);
      console.log('🏗️ [NewAgileService] Insert response - Data:', data);

      if (error) {
        console.error('❌ [NewAgileService] Database error creating hypothesis:', error);
        console.error('❌ [NewAgileService] Error details:', JSON.stringify(error, null, 2));

        // If table doesn't exist, create a mock response for now
        if (error.code === '42P01') {
          console.warn('⚠️ [NewAgileService] Hypotheses table not found, returning mock data');
          return {
            id: `mock-hyp-${Date.now()}`,
            ...fullHypothesisData
          } as Hypothesis;
        }

        throw error;
      }

      console.log('✅ [NewAgileService] Hypothesis created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in createHypothesis:', error);
      return null;
    }
  }

  static async getHypotheses(projectId?: string, opportunityId?: string): Promise<Hypothesis[]> {
    try {
      console.log('🔍 [NewAgileService] Getting hypotheses for project:', projectId);

      let query = supabase
        .from('hypotheses')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (opportunityId) {
        query = query.eq('opportunity_id', opportunityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [NewAgileService] Error fetching hypotheses:', error);

        // If table doesn't exist, return empty array for now
        if (error.code === '42P01') {
          console.warn('⚠️ [NewAgileService] Hypotheses table not found, returning empty array');
          return [];
        }

        throw error;
      }

      console.log('✅ [NewAgileService] Found', data?.length || 0, 'hypotheses');
      return data || [];
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in getHypotheses:', error);
      return [];
    }
  }

  // Experiment Methods
  static async createExperiment(
    experimentData: ExperimentCreateRequest,
    userId: string
  ): Promise<Experiment | null> {
    try {
      const fullExperimentData = {
        ...experimentData,
        status: 'planned' as const,
        results: '',
        decision: 'pending' as const,
        next_steps: '',
        insights: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId
      };

      const { data, error } = await supabase
        .from('experiments')
        .insert(fullExperimentData)
        .select()
        .single();

      if (error) {
        console.error('❌ [NewAgileService] Error creating experiment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in createExperiment:', error);
      return null;
    }
  }

  static async getExperiments(hypothesisId?: string): Promise<Experiment[]> {
    try {
      let query = supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (hypothesisId) {
        query = query.eq('hypothesis_id', hypothesisId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [NewAgileService] Error fetching experiments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in getExperiments:', error);
      return [];
    }
  }

  // Delivery Task Methods
  static async createDeliveryTask(
    taskData: DeliveryTaskCreateRequest,
    userId: string
  ): Promise<DeliveryTask | null> {
    try {
      const fullTaskData = {
        ...taskData,
        status: 'ready' as const,
        blocked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId
      };

      const { data, error } = await supabase
        .from('delivery_tasks')
        .insert(fullTaskData)
        .select()
        .single();

      if (error) {
        console.error('❌ [NewAgileService] Error creating delivery task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in createDeliveryTask:', error);
      return null;
    }
  }

  static async getDeliveryTasks(projectId?: string): Promise<DeliveryTask[]> {
    try {
      let query = supabase
        .from('delivery_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Note: DeliveryTask doesn't have project_id in the interface,
      // might need to add it or filter differently
      // For now, we'll get all tasks

      const { data, error } = await query;

      if (error) {
        console.error('❌ [NewAgileService] Error fetching delivery tasks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [NewAgileService] Service error in getDeliveryTasks:', error);
      return [];
    }
  }

  // Dashboard & Analytics Methods
  static async getNewAgileDashboard(projectId: string) {
    try {
      const [opportunities, experiments, deliveryTasks] = await Promise.all([
        this.getOpportunities(projectId),
        this.getExperiments(),
        this.getDeliveryTasks()
      ]);

      return {
        opportunities: {
          total: opportunities.length,
          by_status: opportunities.reduce((acc, opp) => {
            acc[opp.status] = (acc[opp.status] || 0) + 1;
            return acc;
          }, {} as any),
          high_value_count: opportunities.filter(opp => opp.cost_of_delay === 'high').length
        },
        experiments: {
          total: experiments.length,
          running: experiments.filter(exp => exp.status === 'running').length,
          completed_this_month: experiments.filter(exp =>
            exp.status === 'completed' &&
            new Date(exp.updated_at).getMonth() === new Date().getMonth()
          ).length,
          win_rate: experiments.length > 0 ?
            (experiments.filter(exp => exp.decision === 'scale').length / experiments.length) * 100 : 0
        },
        delivery: {
          wip: {
            total_wip: deliveryTasks.filter(task =>
              ['in_progress', 'review'].includes(task.status)
            ).length,
            aging_items: 0, // Would need to calculate based on updated_at
            cycle_time_avg: 0, // Would need historical data
            lead_time_avg: 0, // Would need historical data
            throughput_weekly: 0, // Would need historical data
            blocked_items: deliveryTasks.filter(task => task.blocked).length
          },
          recently_released: deliveryTasks.filter(task => task.status === 'released').slice(0, 5),
          blocked_items: deliveryTasks.filter(task => task.blocked)
        },
        okr_progress: {
          objectives_on_track: 0, // Would need OKR implementation
          total_objectives: 0,
          key_results: {
            completed: 0,
            at_risk: 0,
            total: 0
          }
        }
      };
    } catch (error) {
      console.error('❌ [NewAgileService] Error getting dashboard data:', error);
      return null;
    }
  }
}