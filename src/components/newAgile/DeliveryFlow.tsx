import React, { useState } from 'react';
import type { DeliveryTask, WIPLimits, DeliveryTaskStatus } from '../../types/newAgile';

interface DeliveryFlowProps {
  projectId: string;
  className?: string;
}

const DeliveryFlow: React.FC<DeliveryFlowProps> = ({ projectId, className = '' }) => {
  // Mock WIP limits - in real app this would be configurable
  const wipLimits: WIPLimits = {
    ready: 10,
    in_progress: 3,
    review: 3,
    released: 10,
    measuring: 3
  };

  // Mock tasks - in real app this would come from API
  const [tasks] = useState<DeliveryTask[]>([
    {
      id: '1',
      title: 'Build Scoring Engine',
      description: 'Implement flexible scoring algorithms supporting simple rule-based, weighted scoring, and basic ML models',
      status: 'ready',
      priority: 'high',
      effort: 'L',
      assignee: 'John Doe',
      acceptance_criteria: [
        'Supports rule-based scoring',
        'Configurable weights',
        'API endpoints created'
      ],
      definition_of_ready: [],
      definition_of_done: [],
      blocked: false,
      tags: ['backend', 'scoring'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user1'
    }
  ]);

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<DeliveryTaskStatus, DeliveryTask[]>);

  // Calculate aging items (>3 days)
  const agingThreshold = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  const agingItems = tasks.filter(task => {
    const updatedTime = new Date(task.updated_at).getTime();
    const now = new Date().getTime();
    return now - updatedTime > agingThreshold && task.status !== 'ready';
  });

  const columns: { id: DeliveryTaskStatus; title: string; limit?: number }[] = [
    { id: 'ready', title: 'Ready', limit: wipLimits.ready },
    { id: 'in_progress', title: 'In Progress', limit: wipLimits.in_progress },
    { id: 'review', title: 'Review', limit: wipLimits.review },
    { id: 'released', title: 'Released' },
    { id: 'measuring', title: 'Measuring', limit: wipLimits.measuring }
  ];

  const getColumnTasks = (status: DeliveryTaskStatus) => tasksByStatus[status] || [];

  const isWipExceeded = (status: DeliveryTaskStatus) => {
    const limit = wipLimits[status];
    if (!limit) return false;
    return getColumnTasks(status).length >= limit;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const TaskCard = ({ task }: { task: DeliveryTask }) => (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-3 mb-3 hover:bg-white/10 transition-colors cursor-pointer ${
      task.blocked ? 'border-red-400/50 bg-red-500/10' : ''
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-white font-medium text-sm leading-tight">{task.title}</h4>
        <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <p className="text-white/70 text-xs mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-white/60 text-xs">{task.effort}</span>
          {task.assignee && (
            <div className="w-5 h-5 bg-blue-500/30 rounded-full flex items-center justify-center">
              <span className="text-xs text-blue-200">{task.assignee[0]}</span>
            </div>
          )}
        </div>

        {task.blocked && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs text-red-400">Blocked</span>
          </div>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-white/50">+{task.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );

  const totalWip = tasks.filter(t => ['in_progress', 'review'].includes(t.status)).length;

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Delivery Flow</h2>
              <p className="text-white/70">Kanban with WIP Limits</p>
            </div>
          </div>
        </div>

        {/* Flow Metrics */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-white/70">
            <span className="font-medium">Total WIP:</span>
            <span className="ml-2 text-white">{totalWip}</span>
          </div>
          <div className="text-white/70">
            <span className="font-medium">Aging (&gt;3d):</span>
            <span className="ml-2 text-white">{agingItems.length}</span>
          </div>
        </div>

        {/* WIP Limit Warning */}
        {(isWipExceeded('in_progress') || isWipExceeded('review')) && (
          <div className="mt-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-300 text-sm font-medium">
                WIP limit exceeded in one or more columns. Consider completing work before starting new items.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <div className="grid grid-cols-5 gap-4">
          {columns.map(column => {
            const columnTasks = getColumnTasks(column.id);
            const isLimitExceeded = isWipExceeded(column.id);

            return (
              <div key={column.id} className="min-h-96">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{column.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm px-2 py-1 rounded ${
                        isLimitExceeded ? 'bg-red-500/20 text-red-300' : 'text-white/70'
                      }`}>
                        {columnTasks.length}
                        {column.limit && ` / ${column.limit}`}
                      </span>
                    </div>
                  </div>

                  {column.limit && (
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          isLimitExceeded ? 'bg-red-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(100, (columnTasks.length / column.limit) * 100)}%` }}
                      />
                    </div>
                  )}

                  {column.id === 'ready' && (
                    <div className="mt-2 text-xs text-white/50">
                      <div className="bg-white/5 rounded p-2 border border-white/10">
                        <div className="font-medium mb-1">WIP limit reached</div>
                        <div>Must reference supporting experiment</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {columnTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeliveryFlow;