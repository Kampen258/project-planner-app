import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';

interface DeliveryFlowWorkingProps {
  projectId: string;
  projectName?: string;
  className?: string;
  tasks?: Task[];
  onTaskCreate?: (task: Partial<Task>) => Promise<void>;
  onTaskUpdate?: (task: Task) => Promise<void>;
}

// ULTRA SIMPLE VERSION - NO EXTERNAL DEPENDENCIES
const DeliveryFlowWorking: React.FC<DeliveryFlowWorkingProps> = ({
  projectId,
  projectName,
  className = '',
  tasks = [],
  onTaskCreate,
  onTaskUpdate
}) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [displayTasks, setDisplayTasks] = useState(tasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Wizard steps
  const steps = [
    { id: 1, title: 'Basic Information', description: 'Task name and description' },
    { id: 2, title: 'Planning', description: 'Priority, due date, and assignment' },
    { id: 3, title: 'Organization', description: 'Status and positioning' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // WIP limits for each column (New Agile method)
  const [wipLimits, setWipLimits] = useState({
    in_progress: 3, // WIP limit for In Progress
    completed: 3    // WIP limit for Done (before release)
  });

  // Task form data
  const [taskFormData, setTaskFormData] = useState<Partial<Task>>({
    name: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: null,
    assigned_to: null,
    completed: false,
    order_index: null
  });

  // Update displayTasks when tasks prop changes
  useEffect(() => {
    setDisplayTasks(tasks);
  }, [tasks]);

  console.log('🚛 DeliveryFlow: Rendering for project', projectName || projectId, 'with', tasks.length, 'tasks');

  const columns = [
    { id: 'todo', title: 'Ready', color: '#3b82f6', hasWipLimit: false },
    { id: 'in_progress', title: 'In Progress', color: '#f59e0b', hasWipLimit: true, wipLimit: wipLimits.in_progress },
    { id: 'completed', title: 'Done', color: '#10b981', hasWipLimit: true, wipLimit: wipLimits.completed },
    { id: 'cancelled', title: 'Released', color: '#6b7280', hasWipLimit: false },
  ];

  // Check if WIP limit is exceeded
  const getWipStatus = (columnId: string, taskCount: number) => {
    const column = columns.find(col => col.id === columnId);
    if (column?.hasWipLimit && column.wipLimit) {
      return {
        isExceeded: taskCount > column.wipLimit,
        isAtLimit: taskCount === column.wipLimit,
        limit: column.wipLimit,
        count: taskCount
      };
    }
    return { isExceeded: false, isAtLimit: false, limit: 0, count: taskCount };
  };

  // Map task status to swimming lane columns
  const mapTaskToColumn = (task: Task) => {
    // Real task statuses: 'todo' | 'in_progress' | 'completed' | 'cancelled'
    return task.status;
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTaskFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Reset form data
  const resetFormData = () => {
    setTaskFormData({
      name: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: null,
      assigned_to: null,
      completed: false,
      order_index: null
    });
    setCurrentStep(1);
    setError(null);
  };

  const handleCreateTask = async () => {
    if (!taskFormData.name?.trim()) {
      setError('Task name is required');
      return;
    }

    setLoading(true);
    setError(null);

    const newTaskData: Partial<Task> = {
      ...taskFormData,
      project_id: projectId,
      name: taskFormData.name.trim(),
      description: taskFormData.description?.trim() || null,
    };

    try {
      if (onTaskCreate) {
        await onTaskCreate(newTaskData);
      } else {
        // Fallback: add to local state
        const newTask = {
          id: Date.now().toString(),
          ...newTaskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: null,
          ai_suggested: null,
          completed_at: null,
        } as Task;
        setDisplayTasks(prev => [...prev, newTask]);
      }

      resetFormData();
      setShowTaskModal(false);
      console.log('✅ Task created:', newTaskData);
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="8" width="13" height="8" rx="1" strokeWidth={2} />
              <rect x="16" y="10" width="4" height="6" rx="1" strokeWidth={2} />
              <circle cx="7" cy="19" r="1.5" strokeWidth={2} />
              <circle cx="17" cy="19" r="1.5" strokeWidth={2} />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Delivery Flow</h2>
            <p className="text-white/70">{projectName || `Project ${projectId}`} - Kanban with WIP Limits</p>
          </div>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="px-6 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 inline-flex items-center space-x-2"
        >
          <span>Create Task</span>
        </button>
      </div>

      {/* WIP Status Alert */}
      {columns.some(col => {
        const wipStatus = getWipStatus(col.id, displayTasks.filter(task => task.status === col.id).length);
        return wipStatus.isExceeded;
      }) && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-yellow-100">WIP limit exceeded in one or more columns. Consider completing work before starting new items.</p>
          </div>
        </div>
      )}

      {/* Delivery Lanes */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = displayTasks.filter(task => task.status === column.id);
          const wipStatus = getWipStatus(column.id, columnTasks.length);

          return (
            <div key={column.id} className="bg-white/5 rounded-lg p-4 min-h-[400px]">
              <div className="mb-4 pb-2 border-b-2" style={{ borderColor: column.color }}>
                <h3 className="font-semibold text-white text-center">
                  {column.title}
                </h3>
                {column.hasWipLimit && (
                  <div className="text-center mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        wipStatus.isExceeded
                          ? 'bg-red-500/20 text-red-200'
                          : wipStatus.isAtLimit
                          ? 'bg-yellow-500/20 text-yellow-200'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {wipStatus.count} / {wipStatus.limit} items
                    </span>
                  </div>
                )}
                {!column.hasWipLimit && (
                  <div className="text-center mt-1">
                    <span className="text-xs text-white/50">
                      {columnTasks.length} items
                    </span>
                  </div>
                )}
              </div>

              {/* Tasks in this column */}
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/10 border border-white/20 rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <div className="text-white font-medium text-sm mb-2">{task.name}</div>
                    <div className="text-white/70 text-xs mb-1">
                      {task.assigned_to || 'Unassigned'}
                    </div>
                    {task.priority && (
                      <div className="text-white/50 text-xs">
                        Priority: {task.priority}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Summary */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-white/70 text-sm">
        <div>Total: <span className="text-white font-medium">{displayTasks.length}</span></div>
        <div>In Progress: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'in_progress').length}</span></div>
        <div>Completed: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'completed').length}</span></div>
        <div>Cancelled: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'cancelled').length}</span></div>
      </div>

      {/* Task Creation Modal - Wizard Style */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto">
            <div className="relative w-full max-w-4xl bg-gray-800/70 backdrop-blur-md border border-gray-600/20 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Create New Task</h3>
                    <p className="text-white/60 mt-1">{steps[currentStep - 1].description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      resetFormData();
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Step Progress */}
                <div className="flex items-center space-x-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.id === currentStep
                            ? 'bg-blue-500 text-white'
                            : step.id < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-white/20 text-white/60'
                        }`}
                      >
                        {step.id < currentStep ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className="ml-2 text-sm text-white/70">{step.title}</span>
                      {step.id < steps.length && <div className="ml-4 w-8 h-px bg-white/20" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                    <p className="text-red-200">{error}</p>
                  </div>
                )}

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Task Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={taskFormData.name || ''}
                        onChange={handleFormChange}
                        placeholder="Enter a clear, descriptive task name"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Description</label>
                      <textarea
                        name="description"
                        value={taskFormData.description || ''}
                        onChange={handleFormChange}
                        placeholder="Provide detailed information about what needs to be done, acceptance criteria, or any relevant context"
                        rows={4}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Planning */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Priority</label>
                      <select
                        name="priority"
                        value={taskFormData.priority || 'medium'}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      >
                        <option value="low">Low - Nice to have, can be done later</option>
                        <option value="medium">Medium - Standard priority</option>
                        <option value="high">High - Important, should be done soon</option>
                        <option value="urgent">Urgent - Critical, needs immediate attention</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Due Date</label>
                      <input
                        type="date"
                        name="due_date"
                        value={taskFormData.due_date || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Assigned To</label>
                      <input
                        type="text"
                        name="assigned_to"
                        value={taskFormData.assigned_to || ''}
                        onChange={handleFormChange}
                        placeholder="Enter the person responsible for this task"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Organization */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Initial Status</label>
                      <select
                        name="status"
                        value={taskFormData.status || 'todo'}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      >
                        <option value="todo">To Do - Ready to be started</option>
                        <option value="in_progress">In Progress - Currently being worked on</option>
                        <option value="completed">Completed - Task is finished</option>
                        <option value="cancelled">Cancelled - Task is no longer needed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Order Index</label>
                      <input
                        type="number"
                        name="order_index"
                        value={taskFormData.order_index || ''}
                        onChange={handleFormChange}
                        placeholder="Optional: Set custom ordering (lower numbers appear first)"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      />
                    </div>

                    {/* Task Summary */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-3">Task Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Name:</span>
                          <span className="text-white">{taskFormData.name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Priority:</span>
                          <span className="text-white capitalize">{taskFormData.priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Status:</span>
                          <span className="text-white capitalize">{taskFormData.status?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Assigned To:</span>
                          <span className="text-white">{taskFormData.assigned_to || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Due Date:</span>
                          <span className="text-white">{taskFormData.due_date || 'No due date'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex justify-between">
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    resetFormData();
                  }}
                  className="px-6 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>

                <div className="flex space-x-3">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      disabled={loading}
                      className="px-6 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </button>
                  )}

                  {currentStep < steps.length ? (
                    <button
                      onClick={nextStep}
                      disabled={loading || (currentStep === 1 && !taskFormData.name?.trim())}
                      className="px-6 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateTask}
                      disabled={loading || !taskFormData.name?.trim()}
                      className="px-8 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                    >
                      {loading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      <span>Create Task</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryFlowWorking;