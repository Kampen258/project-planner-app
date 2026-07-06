import React, { useState, useEffect, useCallback } from 'react';
import type { Opportunity, Hypothesis, Experiment, OpportunityCreateRequest, HypothesisCreateRequest, ExperimentCreateRequest } from '../../types/newAgile';
import OpportunityModal from './OpportunityModal';
import HypothesisModal from './HypothesisModal';
import ExperimentModal from './ExperimentModal';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { NewAgileService } from '../../services/newAgileService';

interface DiscoveryPipelineProps {
  projectId: string;
  className?: string;
}

type TabType = 'opportunities' | 'hypotheses' | 'experiments';

const statusBadgeClasses: Record<string, string> = {
  backlog: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  researching: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  validated: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  archived: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  in_test: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  learning: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  scaled: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  killed: 'bg-red-500/20 text-red-300 border-red-500/30',
  planned: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  running: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusBadgeClasses[status] ?? statusBadgeClasses.backlog}`}>
    {status.replace('_', ' ')}
  </span>
);

const DiscoveryPipeline: React.FC<DiscoveryPipelineProps> = ({ projectId, className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('opportunities');
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showHypothesisModal, setShowHypothesisModal] = useState(false);
  const [showExperimentModal, setShowExperimentModal] = useState(false);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPipeline = useCallback(async () => {
    try {
      const [opps, hyps, exps] = await Promise.all([
        NewAgileService.getOpportunities(projectId),
        NewAgileService.getHypotheses(projectId),
        NewAgileService.getExperiments(projectId)
      ]);
      setOpportunities(opps);
      setHypotheses(hyps);
      setExperiments(exps);
    } catch (error) {
      console.error('❌ Failed to load discovery pipeline:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadPipeline();
  }, [loadPipeline]);

  const handleNewOpportunity = () => {
    setShowOpportunityModal(true);
  };

  const handleSaveOpportunity = async (opportunityData: OpportunityCreateRequest) => {
    try {
      const result = await NewAgileService.createOpportunity(
        opportunityData,
        projectId,
        user?.id ?? 'anonymous'
      );

      if (result) {
        console.log('✅ Opportunity saved successfully:', result);
        // Append immediately (works even when the DB is unreachable and the
        // service returns its mock fallback), then refetch for DB truth.
        setOpportunities(prev => [result, ...prev]);
        void loadPipeline();
      } else {
        throw new Error('Failed to create opportunity');
      }
    } catch (error) {
      console.error('❌ Failed to save opportunity:', error);
      throw error;
    }
  };

  const handleNewHypothesis = () => {
    setShowHypothesisModal(true);
  };

  const handleSaveHypothesis = async (hypothesisData: HypothesisCreateRequest) => {
    try {
      const result = await NewAgileService.createHypothesis(
        hypothesisData,
        projectId,
        user?.id ?? 'anonymous'
      );

      if (result) {
        console.log('✅ Hypothesis saved successfully:', result);
        setHypotheses(prev => [result, ...prev]);
        void loadPipeline();
      } else {
        throw new Error('Failed to create hypothesis');
      }
    } catch (error) {
      console.error('❌ Failed to save hypothesis:', error);
      throw error;
    }
  };

  const handleNewExperiment = () => {
    setShowExperimentModal(true);
  };

  const handleSaveExperiment = async (experimentData: ExperimentCreateRequest) => {
    try {
      const result = await NewAgileService.createExperiment(
        experimentData,
        projectId,
        user?.id ?? 'anonymous'
      );

      if (result) {
        console.log('✅ Experiment saved successfully:', result);
        setExperiments(prev => [result, ...prev]);
        void loadPipeline();
      } else {
        throw new Error('Failed to create experiment');
      }
    } catch (error) {
      console.error('❌ Failed to save experiment:', error);
      throw error;
    }
  };

  const EmptyState = ({ type, description, cta, onAdd }: { type: string; description: string; cta: string; onAdd: () => void }) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-2">No {type} yet</h3>
      <p className="text-white/60 mb-6">{description}</p>
      <button
        onClick={onAdd}
        className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>{cta}</span>
      </button>
    </div>
  );

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">{opportunity.title}</h4>
        <StatusBadge status={opportunity.status} />
      </div>
      {opportunity.problem_statement && (
        <p className="text-white/70 text-sm mb-3 line-clamp-2">{opportunity.problem_statement}</p>
      )}
      <div className="flex items-center flex-wrap gap-2 text-xs text-white/60">
        {opportunity.confidence != null && <span className="px-2 py-1 bg-white/10 rounded">Confidence: {opportunity.confidence}/10</span>}
        {opportunity.effort && <span className="px-2 py-1 bg-white/10 rounded">Effort: {opportunity.effort}</span>}
        {opportunity.risk && <span className="px-2 py-1 bg-white/10 rounded">Risk: {opportunity.risk}</span>}
        {opportunity.cost_of_delay && <span className="px-2 py-1 bg-white/10 rounded">Cost of delay: {opportunity.cost_of_delay}</span>}
      </div>
    </div>
  );

  const HypothesisCard = ({ hypothesis }: { hypothesis: Hypothesis }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">{hypothesis.title}</h4>
        <StatusBadge status={hypothesis.status} />
      </div>
      {hypothesis.hypothesis_statement && (
        <p className="text-white/70 text-sm mb-3 line-clamp-2">{hypothesis.hypothesis_statement}</p>
      )}
      <div className="flex items-center flex-wrap gap-2 text-xs text-white/60">
        {hypothesis.test_method && <span className="px-2 py-1 bg-white/10 rounded">Method: {hypothesis.test_method.replace('_', ' ')}</span>}
        {hypothesis.success_criteria && <span className="px-2 py-1 bg-white/10 rounded">Success: {hypothesis.success_criteria}</span>}
      </div>
    </div>
  );

  const ExperimentCard = ({ experiment }: { experiment: Experiment }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">{experiment.title}</h4>
        <StatusBadge status={experiment.status} />
      </div>
      {experiment.description && (
        <p className="text-white/70 text-sm mb-3 line-clamp-2">{experiment.description}</p>
      )}
      <div className="flex items-center flex-wrap gap-2 text-xs text-white/60">
        {experiment.method && <span className="px-2 py-1 bg-white/10 rounded">Method: {experiment.method.replace('_', ' ')}</span>}
        {experiment.start_date && experiment.end_date && (
          <span className="px-2 py-1 bg-white/10 rounded">
            {new Date(experiment.start_date).toLocaleDateString()} → {new Date(experiment.end_date).toLocaleDateString()}
          </span>
        )}
        <span className="px-2 py-1 bg-white/10 rounded">Decision: {experiment.decision}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Discovery Pipeline</h2>
              <p className="text-white/70">Problem-first opportunity backlog with hypothesis testing</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'opportunities') {
                handleNewOpportunity();
              } else if (activeTab === 'hypotheses') {
                handleNewHypothesis();
              } else {
                handleNewExperiment();
              }
            }}
            className="px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30 bg-white/20 hover:bg-white/30 text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New {activeTab === 'opportunities' ? 'Opportunity' : activeTab === 'hypotheses' ? 'Hypothesis' : 'Experiment'}</span>
          </button>
        </div>

        {/* Discovery Sub-tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              activeTab === 'opportunities'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Opportunities ({opportunities.length})
          </button>

          <button
            onClick={() => setActiveTab('hypotheses')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              activeTab === 'hypotheses'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Hypotheses ({hypotheses.length})
          </button>

          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              activeTab === 'experiments'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Experiments ({experiments.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'opportunities' && (
          <div>
            {opportunities.length === 0 ? (
              <EmptyState
                type="opportunities"
                description="Start by identifying user problems and opportunities"
                cta="Create First Opportunity"
                onAdd={handleNewOpportunity}
              />
            ) : (
              <div className="space-y-4">
                {opportunities.map(opportunity => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hypotheses' && (
          <div>
            {hypotheses.length === 0 ? (
              <EmptyState
                type="hypotheses"
                description="Start by creating hypotheses from your opportunities"
                cta="Create First Hypothesis"
                onAdd={handleNewHypothesis}
              />
            ) : (
              <div className="space-y-4">
                {hypotheses.map(hypothesis => (
                  <HypothesisCard key={hypothesis.id} hypothesis={hypothesis} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'experiments' && (
          <div>
            {experiments.length === 0 ? (
              <EmptyState
                type="experiments"
                description="Start by creating experiments to test your hypotheses"
                cta="Create First Experiment"
                onAdd={handleNewExperiment}
              />
            ) : (
              <div className="space-y-4">
                {experiments.map(experiment => (
                  <ExperimentCard key={experiment.id} experiment={experiment} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={showOpportunityModal}
        onClose={() => setShowOpportunityModal(false)}
        onSave={handleSaveOpportunity}
        projectId={projectId}
      />

      {/* Hypothesis Modal */}
      <HypothesisModal
        isOpen={showHypothesisModal}
        onClose={() => setShowHypothesisModal(false)}
        onSave={handleSaveHypothesis}
        projectId={projectId}
      />

      {/* Experiment Modal */}
      <ExperimentModal
        isOpen={showExperimentModal}
        onClose={() => setShowExperimentModal(false)}
        onSave={handleSaveExperiment}
        projectId={projectId}
      />
    </div>
  );
};

export default DiscoveryPipeline;
