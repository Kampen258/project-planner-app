import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';

interface TasksManagementProps {
  projectId: string;
  projectName: string;
  className?: string;
  selectedPhaseId?: string | null;
}

// All possible task statuses across the app
type AllTaskStatus =
  | 'backlog'      // Ideas/future tasks not yet prioritized
  | 'todo'         // Legacy status from general tasks
  | 'ready'        // New Agile: Ready to start
  | 'in_progress'  // Currently being worked on
  | 'review'       // Under review/testing
  | 'done'         // Legacy status from general tasks
  | 'released'     // New Agile: Deployed/shipped
  | 'measuring'    // New Agile: Monitoring results
  | 'blocked'      // Cannot proceed
  | 'cancelled';   // Task cancelled/abandoned

const TasksManagement: React.FC<TasksManagementProps> = ({
  projectId,
  projectName,
  className = '',
  selectedPhaseId
}) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<AllTaskStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Get comprehensive mock tasks for the project with all statuses
  const getMockTasksForProject = (projectId: string) => {
    return [
      // Backlog items
      { id: `${projectId}-b1`, title: 'Future feature: Advanced analytics', status: 'backlog', priority: 'low', phaseId: 'phase-6', description: 'Long-term enhancement idea', project_id: projectId },
      { id: `${projectId}-b2`, title: 'Research: AI integration possibilities', status: 'backlog', priority: 'medium', phaseId: 'phase-6', description: 'Investigate AI opportunities', project_id: projectId },
      { id: `${projectId}-b3`, title: 'Consider mobile app version', status: 'backlog', priority: 'low', phaseId: 'phase-6', description: 'Future mobile development', project_id: projectId },

      // Legacy todo/done items (from general task system)
      { id: `${projectId}-t1`, title: 'Initial project setup', status: 'done', priority: 'high', phaseId: 'phase-1', description: 'Project initialization completed', project_id: projectId },
      { id: `${projectId}-t2`, title: 'Stakeholder interviews', status: 'done', priority: 'high', phaseId: 'phase-1', description: 'Completed user research', project_id: projectId },
      { id: `${projectId}-t3`, title: 'Final documentation review', status: 'todo', priority: 'medium', phaseId: 'phase-5', description: 'Review all project docs', project_id: projectId },

      // Blocked items
      { id: `${projectId}-bl1`, title: 'Third-party API integration', status: 'blocked', priority: 'high', phaseId: 'phase-2', description: 'Waiting for API access from vendor', project_id: projectId },
      { id: `${projectId}-bl2`, title: 'Security audit', status: 'blocked', priority: 'medium', phaseId: 'phase-4', description: 'Waiting for security team availability', project_id: projectId },

      // Cancelled items
      { id: `${projectId}-c1`, title: 'Custom authentication system', status: 'cancelled', priority: 'medium', phaseId: 'phase-1', description: 'Decided to use OAuth instead', project_id: projectId },
      { id: `${projectId}-c2`, title: 'Complex reporting dashboard', status: 'cancelled', priority: 'low', phaseId: 'phase-3', description: 'Out of scope for MVP', project_id: projectId },

      // Current delivery flow items (ready -> measuring)
      { id: `${projectId}-1`, title: 'Design quiz question types', status: 'ready', priority: 'high', phaseId: 'phase-1', description: 'Define different types of quiz questions', project_id: projectId },
      { id: `${projectId}-2`, title: 'Create database schema', status: 'in_progress', priority: 'high', phaseId: 'phase-1', description: 'Design quiz data structure', project_id: projectId },
      { id: `${projectId}-3`, title: 'Setup user authentication', status: 'review', priority: 'medium', phaseId: 'phase-1', description: 'Implement user login system', project_id: projectId },
      { id: `${projectId}-6`, title: 'Add scoring system', status: 'released', priority: 'high', phaseId: 'phase-2', description: 'Calculate and store quiz scores', project_id: projectId },
      { id: `${projectId}-9`, title: 'Add progress indicators', status: 'measuring', priority: 'low', phaseId: 'phase-3', description: 'Show quiz progress to users', project_id: projectId },
    ];
  };

  useEffect(() => {
    // Simulate loading project tasks
    setTimeout(() => {
      setTasks(getMockTasksForProject(projectId));
      setLoading(false);
    }, 500);
  }, [projectId]);

  // Get status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      backlog: {
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: '📋',
        label: 'Backlog',
        description: 'Future ideas and unplanned work'
      },
      todo: {
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: '📝',
        label: 'To Do',
        description: 'Ready to be worked on'
      },
      ready: {
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        icon: '🚀',
        label: 'Ready',
        description: 'Refined and ready to start'
      },
      in_progress: {
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: '⚡',
        label: 'In Progress',
        description: 'Currently being worked on'
      },
      review: {
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        icon: '👁️',
        label: 'Review',
        description: 'Under review or testing'
      },
      done: {
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: '✅',
        label: 'Done',
        description: 'Completed work'
      },
      released: {
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: '🎉',
        label: 'Released',
        description: 'Shipped to production'
      },
      measuring: {
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: '📊',
        label: 'Measuring',
        description: 'Monitoring results'
      },
      blocked: {
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: '🚫',
        label: 'Blocked',
        description: 'Cannot proceed due to dependencies'
      },
      cancelled: {
        color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        icon: '❌',
        label: 'Cancelled',
        description: 'Work that was abandoned'
      },
    };
    return configs[status as keyof typeof configs] || configs.todo;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (activeStatusFilter !== 'all' && task.status !== activeStatusFilter) return false;
    if (selectedPhaseId && task.phaseId !== selectedPhaseId) return false;
    return true;
  });

  // Group tasks by status
  const tasksByStatus = filteredTasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  // Status tabs
  const statusTabs = [
    { key: 'all', label: 'All Tasks', count: tasks.length },
    { key: 'backlog', label: 'Backlog', count: tasks.filter(t => t.status === 'backlog').length },
    { key: 'done', label: 'Completed', count: tasks.filter(t => ['done', 'released', 'measuring'].includes(t.status)).length },
    { key: 'blocked', label: 'Blocked', count: tasks.filter(t => t.status === 'blocked').length },
    { key: 'cancelled', label: 'Cancelled', count: tasks.filter(t => t.status === 'cancelled').length },
  ];

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">All Tasks</h2>
              <p className="text-white/70">{projectName} - Complete task overview</p>
            </div>
          </div>

          <button className="px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30 bg-white/20 hover:bg-white/30 text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Task</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex space-x-1 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusFilter(tab.key as AllTaskStatus | 'all')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeStatusFilter === tab.key
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Task Content */}
      <div className="p-6">
        {activeStatusFilter === 'all' ? (
          // Show all tasks grouped by status
          <div className="space-y-8">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const config = getStatusConfig(status);
              return (
                <div key={status}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{config.label}</h3>
                      <p className="text-sm text-white/60">{config.description} ({statusTasks.length} tasks)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statusTasks.map(task => (
                      <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-white text-sm">{task.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-white/70 text-xs mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-white/50">Phase {task.phaseId?.replace('phase-', '')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Show filtered tasks in a simple list
          <div>
            <div className="mb-4">
              <p className="text-white/70">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                {activeStatusFilter !== 'all' && ` with status "${getStatusConfig(activeStatusFilter).label}"`}
                {selectedPhaseId && ` in ${selectedPhaseId.replace('phase-', 'Phase ')}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => {
                const config = getStatusConfig(task.status);
                return (
                  <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white text-sm">{task.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-white/70 text-xs mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-white/50">Phase {task.phaseId?.replace('phase-', '')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">No tasks found</h3>
            <p className="text-white/60">No tasks match the current filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksManagement;