import React, { useState, useEffect } from 'react';
import type { Phase } from '../../types/newAgile';

interface PhaseSelectorProps {
  projectId: string;
  projectName: string;
  onPhaseSelect: (phase: Phase) => void;
  className?: string;
}

// Mock data for demonstration - would be replaced with actual data fetching
const mockPhases: Phase[] = [
  {
    id: 'phase-1',
    project_id: 'project-1',
    name: 'Quiz Planning Phase',
    description: 'Initial planning and strategy for quiz implementation',
    status: 'completed',
    order: 1,
    progress_percentage: 100,
    task_count: 12,
    completed_task_count: 12,
    color: '#10b981',
    estimated_duration_weeks: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'phase-2',
    project_id: 'project-1',
    name: 'Quiz Development',
    description: 'Core development of quiz functionality and features',
    status: 'in_progress',
    order: 2,
    progress_percentage: 65,
    task_count: 18,
    completed_task_count: 12,
    color: '#f59e0b',
    estimated_duration_weeks: 4,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'phase-3',
    project_id: 'project-1',
    name: 'User Interface Design',
    description: 'Design and implement user-friendly quiz interface',
    status: 'in_progress',
    order: 3,
    progress_percentage: 30,
    task_count: 15,
    completed_task_count: 5,
    color: '#3b82f6',
    estimated_duration_weeks: 3,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'phase-4',
    project_id: 'project-1',
    name: 'Testing & Quality Assurance',
    description: 'Comprehensive testing and bug fixes',
    status: 'not_started',
    order: 4,
    progress_percentage: 0,
    task_count: 10,
    completed_task_count: 0,
    color: '#8b5cf6',
    estimated_duration_weeks: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'phase-5',
    project_id: 'project-1',
    name: 'Deployment & Launch',
    description: 'Production deployment and launch preparation',
    status: 'not_started',
    order: 5,
    progress_percentage: 0,
    task_count: 8,
    completed_task_count: 0,
    color: '#ef4444',
    estimated_duration_weeks: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'phase-6',
    project_id: 'project-1',
    name: 'Post-Launch Monitoring',
    description: 'Monitor performance and gather user feedback',
    status: 'not_started',
    order: 6,
    progress_percentage: 0,
    task_count: 6,
    completed_task_count: 0,
    color: '#06b6d4',
    estimated_duration_weeks: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
          <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'in_progress':
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <div className="w-2 h-2 rounded-full bg-blue-300"></div>
        </div>
      );
    case 'on_hold':
      return (
        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
          <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-full bg-gray-500/20 border border-gray-500/30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        </div>
      );
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30">Completed</span>;
    case 'in_progress':
      return <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-300 border-blue-500/30">In Progress</span>;
    case 'on_hold':
      return <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-300 border-yellow-500/30">On Hold</span>;
    case 'cancelled':
      return <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-300 border-red-500/30">Cancelled</span>;
    default:
      return <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-500/20 text-gray-300 border-gray-500/30">Not Started</span>;
  }
};

const PhaseSelector: React.FC<PhaseSelectorProps> = ({ projectId, projectName, onPhaseSelect, className = '' }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setPhases(mockPhases);
      setLoading(false);
    }, 500);
  }, [projectId]);

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  const totalTasks = phases.reduce((sum, phase) => sum + phase.task_count, 0);
  const completedTasks = phases.reduce((sum, phase) => sum + phase.completed_task_count, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const phasesInProgress = phases.filter(p => p.status === 'in_progress').length;
  const phasesCompleted = phases.filter(p => p.status === 'completed').length;

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-2">No phases yet</h3>
      <p className="text-white/60 mb-6">Create project phases to organize your work</p>
      <button className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create First Phase</span>
      </button>
    </div>
  );

  if (phases.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{projectName}</h2>
              <p className="text-white/70">Project Phase Overview</p>
            </div>
          </div>

          <button className="px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30 bg-white/20 hover:bg-white/30 text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Phase</span>
          </button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{phases.length}</div>
            <div className="text-sm text-white/60">Total Phases</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-300">{phasesCompleted}</div>
            <div className="text-sm text-white/60">Completed</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-300">{phasesInProgress}</div>
            <div className="text-sm text-white/60">In Progress</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-300">{overallProgress}%</div>
            <div className="text-sm text-white/60">Overall Progress</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">Project Progress</span>
            <span className="text-sm font-medium text-white/70">{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              onClick={() => onPhaseSelect(phase)}
            >
              {/* Phase Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(phase.status)}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white truncate">{phase.name}</h3>
                    <p className="text-sm text-white/60">Phase {phase.order}</p>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {getStatusBadge(phase.status)}
                </div>
              </div>

              {/* Phase Description */}
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{phase.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60">Progress</span>
                  <span className="text-xs font-medium text-white/60">{phase.progress_percentage}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${phase.progress_percentage}%`,
                      backgroundColor: phase.color || '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>

              {/* Phase Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {phase.completed_task_count}
                  </div>
                  <div className="text-xs text-white/60">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white/70">{phase.task_count}</div>
                  <div className="text-xs text-white/60">Total Tasks</div>
                </div>
              </div>

              {/* Timeline Info */}
              {phase.estimated_duration_weeks && (
                <div className="flex items-center space-x-2 text-xs text-white/60">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{phase.estimated_duration_weeks} week{phase.estimated_duration_weeks > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline View Toggle */}
        <div className="mt-6 text-center">
          <button className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 hover:bg-white/10 transition-colors text-white/80 font-medium inline-flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>View Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseSelector;