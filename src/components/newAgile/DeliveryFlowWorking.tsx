import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';

interface DeliveryFlowWorkingProps {
  projectId: string;
  projectName?: string;
  className?: string;
  tasks?: Task[];
  selectedPhaseId?: string | null;
  onTaskCreate?: (task: Partial<Task>) => Promise<void>;
  onTaskUpdate?: (task: Task) => Promise<void>;
  onClearPhaseFilter?: () => void;
  onPhaseSelect?: (phaseId: string | null) => void;
}

// ULTRA SIMPLE VERSION - NO EXTERNAL DEPENDENCIES
const DeliveryFlowWorking: React.FC<DeliveryFlowWorkingProps> = ({
  projectId,
  projectName,
  className = '',
  tasks = [],
  selectedPhaseId,
  onTaskCreate,
  onTaskUpdate,
  onClearPhaseFilter,
  onPhaseSelect
}) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [displayTasks, setDisplayTasks] = useState(tasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);

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
    review: 2       // WIP limit for Review (should be smaller for quick feedback)
  });

  // Task form data
  const [taskFormData, setTaskFormData] = useState<Partial<Task>>({
    name: '',
    description: '',
    priority: 'medium',
    status: 'ready',
    due_date: null,
    assigned_to: null,
    completed: false,
    order_index: null
  });

  // Get mock tasks for the specific project
  const getMockTasksForProject = (projectId: string) => {
    // This would normally come from an API call or database
    // For demo purposes, we'll return project-specific tasks based on projectId

    // Default generic tasks for any project
    const genericTasks = [
      { id: `${projectId}-1`, title: 'Project setup and initialization', status: 'ready', priority: 'high', phaseId: 'phase-1', description: 'Set up project structure and dependencies', project_id: projectId },
      { id: `${projectId}-2`, title: 'Requirements analysis', status: 'in_progress', priority: 'high', phaseId: 'phase-1', description: 'Analyze and document project requirements', project_id: projectId },
      { id: `${projectId}-3`, title: 'Architecture design', status: 'review', priority: 'medium', phaseId: 'phase-1', description: 'Design system architecture', project_id: projectId },
      { id: `${projectId}-4`, title: 'Core functionality development', status: 'ready', priority: 'high', phaseId: 'phase-2', description: 'Implement core features', project_id: projectId },
      { id: `${projectId}-5`, title: 'Database integration', status: 'in_progress', priority: 'medium', phaseId: 'phase-2', description: 'Connect and configure database', project_id: projectId },
      { id: `${projectId}-6`, title: 'API development', status: 'released', priority: 'high', phaseId: 'phase-2', description: 'Build REST API endpoints', project_id: projectId },
    ];

    // Special tasks for quiz/education projects
    if (projectId && (projectId.includes('quiz') || projectId.toLowerCase().includes('education'))) {
      return [
        { id: `${projectId}-1`, title: 'Design quiz question types', status: 'ready', priority: 'high', phaseId: 'phase-1', description: 'Define different types of quiz questions', project_id: projectId },
        { id: `${projectId}-2`, title: 'Create database schema', status: 'in_progress', priority: 'high', phaseId: 'phase-1', description: 'Design quiz data structure', project_id: projectId },
        { id: `${projectId}-3`, title: 'Setup user authentication', status: 'review', priority: 'medium', phaseId: 'phase-1', description: 'Implement user login system', project_id: projectId },
        { id: `${projectId}-4`, title: 'Build quiz engine core', status: 'ready', priority: 'high', phaseId: 'phase-2', description: 'Core quiz logic implementation', project_id: projectId },
        { id: `${projectId}-5`, title: 'Implement question randomization', status: 'in_progress', priority: 'medium', phaseId: 'phase-2', description: 'Randomize question order', project_id: projectId },
        { id: `${projectId}-6`, title: 'Add scoring system', status: 'released', priority: 'high', phaseId: 'phase-2', description: 'Calculate and store quiz scores', project_id: projectId },
        { id: `${projectId}-7`, title: 'Design quiz interface', status: 'ready', priority: 'medium', phaseId: 'phase-3', description: 'Create user-friendly quiz UI', project_id: projectId },
        { id: `${projectId}-8`, title: 'Implement responsive design', status: 'in_progress', priority: 'low', phaseId: 'phase-3', description: 'Mobile-friendly interface', project_id: projectId },
        { id: `${projectId}-9`, title: 'Add progress indicators', status: 'measuring', priority: 'low', phaseId: 'phase-3', description: 'Show quiz progress to users', project_id: projectId },
        { id: `${projectId}-10`, title: 'Write unit tests', status: 'ready', priority: 'medium', phaseId: 'phase-4', description: 'Test quiz functionality', project_id: projectId },
        { id: `${projectId}-11`, title: 'Performance testing', status: 'ready', priority: 'high', phaseId: 'phase-4', description: 'Test app under load', project_id: projectId },
        { id: `${projectId}-12`, title: 'Deploy to staging', status: 'ready', priority: 'high', phaseId: 'phase-5', description: 'Deploy to test environment', project_id: projectId },
      ];
    }

    return genericTasks;
  };

  // Get phase name for display
  const getPhaseInfo = (phaseId: string) => {
    const phaseNames = {
      'phase-1': { name: 'Quiz Planning Phase', color: '#10b981' },
      'phase-2': { name: 'Quiz Development', color: '#f59e0b' },
      'phase-3': { name: 'User Interface Design', color: '#3b82f6' },
      'phase-4': { name: 'Testing & Quality Assurance', color: '#8b5cf6' },
      'phase-5': { name: 'Deployment & Launch', color: '#ef4444' },
      'phase-6': { name: 'Post-Launch Monitoring', color: '#06b6d4' },
    };
    return phaseNames[phaseId as keyof typeof phaseNames] || { name: 'Unknown Phase', color: '#6b7280' };
  };

  // Available phases for dropdown
  const availablePhases = [
    { id: 'phase-1', name: 'Quiz Planning Phase', color: '#10b981' },
    { id: 'phase-2', name: 'Quiz Development', color: '#f59e0b' },
    { id: 'phase-3', name: 'User Interface Design', color: '#3b82f6' },
    { id: 'phase-4', name: 'Testing & Quality Assurance', color: '#8b5cf6' },
    { id: 'phase-5', name: 'Deployment & Launch', color: '#ef4444' },
    { id: 'phase-6', name: 'Post-Launch Monitoring', color: '#06b6d4' },
  ];

  // Handle phase selection from dropdown
  const handlePhaseSelection = (phaseId: string | null) => {
    setShowPhaseDropdown(false);
    if (onPhaseSelect) {
      onPhaseSelect(phaseId);
    }
  };

  // Update displayTasks when tasks prop changes or phase filter changes
  useEffect(() => {
    // Get project-specific tasks (either from props or mock data)
    let projectTasks = tasks;

    // If no tasks provided via props, get mock tasks for this specific project
    if (tasks.length === 0) {
      projectTasks = getMockTasksForProject(projectId);
    } else {
      // Filter existing tasks to only show those belonging to this project
      projectTasks = tasks.filter((task: any) =>
        task.project_id === projectId || task.projectId === projectId
      );
    }

    // Further filter by phase if one is selected
    if (selectedPhaseId) {
      const filteredTasks = projectTasks.filter((task: any) =>
        task.phaseId === selectedPhaseId
      );
      setDisplayTasks(filteredTasks);
    } else {
      setDisplayTasks(projectTasks);
    }
  }, [tasks, selectedPhaseId, projectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPhaseDropdown && !(event.target as Element).closest('.relative')) {
        setShowPhaseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPhaseDropdown]);

  console.log('🚛 DeliveryFlow: Rendering for project', {
    projectId,
    projectName,
    resolvedName: projectName || 'New Agile Project',
    providedTasks: tasks.length,
    displayedTasks: displayTasks.length,
    selectedPhase: selectedPhaseId ? getPhaseInfo(selectedPhaseId).name : 'All phases'
  });

  const columns = [
    { id: 'ready', title: 'Ready', color: '#3b82f6', hasWipLimit: false },
    { id: 'in_progress', title: 'In Progress', color: '#f59e0b', hasWipLimit: true, wipLimit: wipLimits.in_progress },
    { id: 'review', title: 'Review', color: '#f97316', hasWipLimit: true, wipLimit: wipLimits.review },
    { id: 'released', title: 'Released', color: '#10b981', hasWipLimit: false },
    { id: 'measuring', title: 'Measuring', color: '#8b5cf6', hasWipLimit: false },
  ];

  // Get priority color for task cards
  const getPriorityColor = (priority: string | null | undefined) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-200',
          border: 'border-red-400/30'
        };
      case 'high':
        return {
          bg: 'bg-orange-500/20',
          text: 'text-orange-200',
          border: 'border-orange-400/30'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-200',
          border: 'border-yellow-400/30'
        };
      case 'low':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-200',
          border: 'border-blue-400/30'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-200',
          border: 'border-gray-400/30'
        };
    }
  };

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
      status: 'ready',
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
            <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8V7c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h1.2c.4 1.7 2 3 3.8 3s3.4-1.3 3.8-3h1.4c.4 1.7 2 3 3.8 3s3.4-1.3 3.8-3H22v-4l-3-3h-2zM8 17c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm9-9h1.5l1.5 1.5V11H17V8zm0 9c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Delivery Flow</h2>
            <div className="flex items-center space-x-2">
              <p className="text-white/70">{projectName ? projectName : 'New Agile Project'} - Kanban with WIP Limits</p>
              {selectedPhaseId && (
                <div className="flex items-center space-x-2">
                  <span className="text-white/50">•</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium border text-white/90"
                    style={{
                      backgroundColor: `${getPhaseInfo(selectedPhaseId).color}20`,
                      borderColor: `${getPhaseInfo(selectedPhaseId).color}30`,
                    }}
                  >
                    {getPhaseInfo(selectedPhaseId).name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Phase Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPhaseDropdown(!showPhaseDropdown)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-all duration-200 inline-flex items-center space-x-2 text-sm border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
              </svg>
              <span>{selectedPhaseId ? getPhaseInfo(selectedPhaseId).name : 'Select Phase'}</span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${showPhaseDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showPhaseDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-50">
                <div className="p-2">
                  {/* All Tasks Option */}
                  <button
                    onClick={() => handlePhaseSelection(null)}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                      !selectedPhaseId
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="w-3 h-3 rounded bg-gray-400"></div>
                    <span className="text-sm font-medium">All Tasks</span>
                  </button>

                  {/* Phase Options */}
                  {availablePhases.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => handlePhaseSelection(phase.id)}
                      className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                        selectedPhaseId === phase.id
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: phase.color }}
                      ></div>
                      <span className="text-sm font-medium">{phase.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedPhaseId && onClearPhaseFilter && (
            <button
              onClick={onClearPhaseFilter}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg transition-all duration-200 inline-flex items-center space-x-2 text-sm border border-white/20"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear Filter</span>
            </button>
          )}
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-6 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 inline-flex items-center space-x-2"
          >
            <span>Create Task</span>
          </button>
        </div>
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
      <div className="grid grid-cols-5 gap-3">
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
                {columnTasks.map((task) => {
                  const priorityColors = getPriorityColor(task.priority);
                  return (
                    <div
                      key={task.id}
                      className="bg-white/10 border border-white/20 rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="text-white font-medium text-sm mb-2">{task.name}</div>
                      <div className="text-white/70 text-xs mb-2">
                        {task.assigned_to || 'Unassigned'}
                      </div>
                      {task.priority && (
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} border`}>
                          {task.priority}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Summary */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-white/70 text-sm">
        <div>Total: <span className="text-white font-medium">{displayTasks.length}</span></div>
        <div>Ready: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'ready').length}</span></div>
        <div>In Progress: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'in_progress').length}</span></div>
        <div>Review: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'review').length}</span></div>
        <div>Released: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'released').length}</span></div>
        <div>Measuring: <span className="text-white font-medium">{displayTasks.filter(t => t.status === 'measuring').length}</span></div>
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
                        value={taskFormData.status || 'ready'}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      >
                        <option value="ready">Ready - Prioritized items ready to start</option>
                        <option value="in_progress">In Progress - Active development work</option>
                        <option value="review">Review - Code review, testing, QA</option>
                        <option value="released">Released - Deployed and live</option>
                        <option value="measuring">Measuring - Validating impact within 14-30 days</option>
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