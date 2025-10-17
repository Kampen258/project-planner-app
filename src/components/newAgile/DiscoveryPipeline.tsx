import React, { useState } from 'react';
import type { Opportunity, Hypothesis, Experiment, OpportunityStatus, ConfidenceLevel, EffortEstimate, RiskLevel, CostOfDelay, OpportunityCreateRequest } from '../../types/newAgile';
import OpportunityModal from './OpportunityModal';
// import HypothesisModal from './HypothesisModal'; // Temporarily disabled due to circular import issue
import { useAuth } from '../../contexts/SimpleAuthContext';
import { NewAgileService } from '../../services/newAgileService';

interface DiscoveryPipelineProps {
  projectId: string;
  className?: string;
}

type TabType = 'opportunities' | 'hypotheses' | 'experiments';

const DiscoveryPipeline: React.FC<DiscoveryPipelineProps> = ({ projectId, className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('opportunities');
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showHypothesisModal, setShowHypothesisModal] = useState(false);
  const [showOpportunityInfo, setShowOpportunityInfo] = useState(false);

  // Mock data - in real app this would come from API
  const opportunities: Opportunity[] = [];
  const hypotheses: Hypothesis[] = [];
  const experiments: Experiment[] = [];

  const handleNewOpportunity = () => {
    setShowOpportunityModal(true);
  };

  const handleSaveOpportunity = async (opportunityData: OpportunityCreateRequest) => {
    try {
      console.log('Saving opportunity:', opportunityData);

      const result = await NewAgileService.createOpportunity(
        opportunityData,
        projectId,
        user?.id || 'anonymous'
      );

      if (result) {
        console.log('✅ Opportunity saved successfully:', result);
        // TODO: Refresh opportunities list after successful creation
        // For now, the user will see the new opportunity after refresh
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

  const handleSaveHypothesis = async (hypothesisData: any) => {
    try {
      console.log('Saving hypothesis:', hypothesisData);

      const result = await NewAgileService.createHypothesis(
        hypothesisData,
        projectId,
        user?.id || 'anonymous'
      );

      if (result) {
        console.log('✅ Hypothesis saved successfully:', result);
        // TODO: Refresh hypotheses list after successful creation
      } else {
        throw new Error('Failed to create hypothesis');
      }
    } catch (error) {
      console.error('❌ Failed to save hypothesis:', error);
      throw error;
    }
  };

  const handleNewExperiment = () => {
    // TODO: Open experiment creation modal
    console.log('Creating new experiment');
  };

  const EmptyState = ({ type, onAdd }: { type: string; onAdd: () => void }) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-2">No {type} yet</h3>
      <p className="text-white/60 mb-6">Start by identifying user problems and opportunities</p>
      <button
        onClick={onAdd}
        className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create First {type.slice(0, -1)}</span>
      </button>
    </div>
  );

  return (
    <div className={className}>
      {/* Opportunities Content */}
      <div>
        {opportunities.length === 0 ? (
          <EmptyState type="opportunities" onAdd={handleNewOpportunity} />
        ) : (
          <div>
            {/* Opportunities content will go here */}
            <p className="text-white/80">Opportunities list component</p>
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

      {/* Hypothesis Modal - Temporarily disabled due to circular import issue */}
      {/* <HypothesisModal
        isOpen={showHypothesisModal}
        onClose={() => setShowHypothesisModal(false)}
        onSave={handleSaveHypothesis}
        projectId={projectId}
      /> */}
    </div>
  );
};

export default DiscoveryPipeline;