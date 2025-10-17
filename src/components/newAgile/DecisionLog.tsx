import React from 'react';
import type { Decision } from '../../types/newAgile';

interface DecisionLogProps {
  projectId: string;
  className?: string;
}

const DecisionLog: React.FC<DecisionLogProps> = ({ projectId, className = '' }) => {
  // Mock data - in real app this would come from API
  const decisions: Decision[] = [];

  const handleNewDecision = () => {
    // TODO: Open decision creation modal
    console.log('Creating new decision');
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-2">No decisions yet</h3>
      <p className="text-white/60 mb-6">Start documenting your product decisions</p>
      <button
        onClick={handleNewDecision}
        className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create First Decision</span>
      </button>
    </div>
  );

  const DecisionCard = ({ decision }: { decision: Decision }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{decision.title}</h3>
          <p className="text-white/70 mb-3">{decision.context}</p>

          <div className="flex items-center space-x-3">
            <span className="text-white/60 text-sm">Owner: {decision.owner}</span>
            <span className="text-white/60 text-sm">
              Date: {new Date(decision.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Made */}
      <div className="mb-4 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
        <h4 className="text-green-300 font-semibold text-sm mb-2">Decision Made</h4>
        <p className="text-green-200">{decision.decision}</p>
      </div>

      {/* Rationale */}
      <div className="mb-4">
        <h4 className="text-white font-semibold text-sm mb-2">Rationale</h4>
        <p className="text-white/80">{decision.rationale}</p>
      </div>

      {/* Options Considered */}
      {decision.options_considered.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-3">Options Considered</h4>
          <div className="space-y-3">
            {decision.options_considered.map((option, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <h5 className="text-white font-medium mb-2">{option.option}</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-green-300 font-medium">Pros:</span>
                    <ul className="text-green-200/80 mt-1 space-y-1">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-green-400 mt-1">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-red-300 font-medium">Cons:</span>
                    <ul className="text-red-200/80 mt-1 space-y-1">
                      {option.cons.map((con, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-red-400 mt-1">-</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {decision.evidence.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-2">Supporting Evidence</h4>
          <ul className="text-white/80 text-sm space-y-1">
            {decision.evidence.map((evidence, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Criteria */}
      {decision.success_criteria.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-2">Success Criteria</h4>
          <ul className="text-white/80 text-sm space-y-1">
            {decision.success_criteria.map((criteria, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">○</span>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stakeholders */}
      {decision.stakeholders.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-2">Stakeholders Consulted</h4>
          <div className="flex flex-wrap gap-2">
            {decision.stakeholders.map(stakeholder => (
              <span key={stakeholder} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                {stakeholder}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Review & Outcome */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-4">
          {decision.review_date && (
            <span className="text-white/60 text-sm">
              Review: {new Date(decision.review_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {decision.outcome && (
          <div className="text-right">
            <div className="text-sm text-white/60 mb-1">Outcome</div>
            <div className="text-sm text-white">{decision.outcome}</div>
          </div>
        )}
      </div>

      {/* Lessons Learned */}
      {decision.lessons_learned && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
          <h4 className="text-yellow-300 font-semibold text-sm mb-2">Lessons Learned</h4>
          <p className="text-yellow-200/80 text-sm">{decision.lessons_learned}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Decision Log</h2>
              <p className="text-white/70">Track significant product decisions and their rationale</p>
            </div>
          </div>

          <button
            onClick={handleNewDecision}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Decision</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {decisions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {decisions.map(decision => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionLog;