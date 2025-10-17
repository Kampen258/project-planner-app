import React, { useState } from 'react';
import type { Objective, KeyResult } from '../../types/newAgile';

interface OKRManagementProps {
  projectId: string;
  className?: string;
}

const OKRManagement: React.FC<OKRManagementProps> = ({ projectId, className = '' }) => {
  // Mock data - in real app this would come from API
  const [objectives] = useState<Objective[]>([]);
  const [keyResults] = useState<KeyResult[]>([]);

  const handleNewOKR = () => {
    // TODO: Open OKR creation modal
    console.log('Creating new OKR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'on_track': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'at_risk': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'not_started': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-400';
    if (progress >= 60) return 'bg-blue-400';
    if (progress >= 30) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-2">No OKRs yet</h3>
      <p className="text-white/60 mb-6">Define objectives and key results to track progress</p>
      <button
        onClick={handleNewOKR}
        className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create Your First OKR</span>
      </button>
    </div>
  );

  const ObjectiveCard = ({ objective }: { objective: Objective }) => {
    const relatedKeyResults = keyResults.filter(kr => kr.objective_id === objective.id);

    // Calculate overall progress
    const totalProgress = relatedKeyResults.reduce((sum, kr) => {
      const progress = kr.target > 0 ? (kr.current_value / kr.target) * 100 : 0;
      return sum + Math.min(100, progress);
    }, 0);
    const avgProgress = relatedKeyResults.length > 0 ? totalProgress / relatedKeyResults.length : 0;

    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{objective.title}</h3>
            <p className="text-white/70 mb-3">{objective.description}</p>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(objective.status)}`}>
                {objective.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-white/60 text-sm">{objective.quarter}</span>
              <span className="text-white/60 text-sm">Owner: {objective.owner}</span>
            </div>
          </div>

          <div className="text-right ml-6">
            <div className="text-2xl font-bold text-white mb-1">{Math.round(avgProgress)}%</div>
            <div className="text-white/70 text-sm mb-2">Progress</div>
            <div className="w-24 bg-white/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(avgProgress)}`}
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Results */}
        {relatedKeyResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white/80 mb-2">Key Results</h4>
            {relatedKeyResults.map(kr => {
              const progress = kr.target > 0 ? (kr.current_value / kr.target) * 100 : 0;
              const clampedProgress = Math.min(100, progress);

              return (
                <div key={kr.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="text-white font-medium mb-1">{kr.title}</h5>
                      <p className="text-white/60 text-sm">{kr.description}</p>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-white">
                        {kr.current_value.toLocaleString()} / {kr.target.toLocaleString()}
                      </div>
                      <div className="text-white/60 text-xs">{kr.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-white/10 rounded-full h-2 mr-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(clampedProgress)}`}
                        style={{ width: `${clampedProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(kr.status)}`}>
                        {kr.status.replace('_', ' ')}
                      </span>
                      <span className="text-white/60 text-xs">
                        {Math.round(clampedProgress)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                    <span>Owner: {kr.owner}</span>
                    <span>Updated: {new Date(kr.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">OKRs</h2>
              <p className="text-white/70">Objectives & Key Results</p>
            </div>
          </div>

          <button
            onClick={handleNewOKR}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New OKR</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {objectives.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {objectives.map(objective => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OKRManagement;