import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { DeliveryTask, WIPLimits, DeliveryTaskStatus, DeliveryTaskCreateRequest } from '../../types/newAgile';
import TaskModal from './TaskModal';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { NewAgileService } from '../../services/newAgileService';

interface DeliveryFlowProps {
  projectId: string;
  className?: string;
}

const DeliveryFlow: React.FC<DeliveryFlowProps> = ({ projectId, className = '' }) => {
  const { user } = useAuth();

  console.log('🏊 DeliveryFlow: Initializing with projectId:', projectId);

  // Mock WIP limits - in real app this would be configurable
  const wipLimits: WIPLimits = {
    ready: 10,
    in_progress: 3,
    review: 3,
    released: 10,
    measuring: 3
  };

  // State management
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<DeliveryTaskStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Sensors for drag and drop - with error handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mock tasks - in real app this would come from API
  const [tasks, setTasks] = useState<DeliveryTask[]>([
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
    },
    {
      id: '2',
      title: 'User Authentication Flow',
      description: 'Implement secure user login and registration with JWT tokens',
      status: 'in_progress',
      priority: 'high',
      effort: 'M',
      assignee: 'Alice Smith',
      acceptance_criteria: [
        'Secure password hashing',
        'JWT token generation',
        'Password reset functionality'
      ],
      definition_of_ready: [],
      definition_of_done: [],
      blocked: false,
      tags: ['frontend', 'auth'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user2'
    },
    {
      id: '3',
      title: 'Dashboard Analytics',
      description: 'Create interactive charts and metrics for project insights',
      status: 'review',
      priority: 'medium',
      effort: 'M',
      assignee: 'Bob Johnson',
      acceptance_criteria: [
        'Real-time data updates',
        'Export to PDF/Excel',
        'Mobile responsive'
      ],
      definition_of_ready: [],
      definition_of_done: [],
      blocked: false,
      tags: ['frontend', 'analytics'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user3'
    },
    {
      id: '4',
      title: 'API Documentation',
      description: 'Complete OpenAPI documentation for all endpoints',
      status: 'ready',
      priority: 'low',
      effort: 'S',
      assignee: 'Carol Davis',
      acceptance_criteria: [
        'All endpoints documented',
        'Interactive examples',
        'Authentication guide'
      ],
      definition_of_ready: [],
      definition_of_done: [],
      blocked: false,
      tags: ['docs', 'backend'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user4'
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

  const getColumnTasks = (status: DeliveryTaskStatus) => {
    const filteredTasksByStatus = getFilteredTasksByStatus();
    return filteredTasksByStatus[status] || [];
  };

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

  // Drag and drop handlers - with error handling
  const handleDragStart = (event: DragStartEvent) => {
    try {
      console.log('🐛 DragStart:', event.active.id);
      setActiveId(event.active.id as string);
    } catch (error) {
      console.error('❌ DragStart error:', error);
      setActiveId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      console.log('🐛 DragEnd:', event.active.id, '->', event.over?.id);
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        return;
      }

      const activeTask = tasks.find(task => task.id === active.id);
      if (!activeTask) {
        console.warn('⚠️ Active task not found:', active.id);
        setActiveId(null);
        return;
      }

      // Check if we're dropping in a different column
      const overColumn = over.id as string;
      const validColumns = ['ready', 'in_progress', 'review', 'released', 'measuring'];

      if (validColumns.includes(overColumn) && activeTask.status !== overColumn) {
        console.log('✅ Moving task:', activeTask.title, 'from', activeTask.status, 'to', overColumn);

        // Update task status
        setTasks(prev => prev.map(task =>
          task.id === active.id
            ? { ...task, status: overColumn as DeliveryTaskStatus, updated_at: new Date().toISOString() }
            : task
        ));
      }

      setActiveId(null);
    } catch (error) {
      console.error('❌ DragEnd error:', error);
      setActiveId(null);
    }
  };

  const findTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  // Task creation handler with graceful fallbacks
  const handleSaveTask = async (taskData: DeliveryTaskCreateRequest) => {
    try {
      console.log('🎯 Saving task:', taskData.title);

      // Create new task with unique ID
      const newTask: DeliveryTask = {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        status: 'ready',
        priority: taskData.priority,
        effort: taskData.effort,
        assignee: taskData.assignee,
        experiment_reference: taskData.experiment_reference,
        hypothesis_reference: taskData.hypothesis_reference,
        acceptance_criteria: taskData.acceptance_criteria,
        definition_of_ready: [],
        definition_of_done: [],
        blocked: false,
        tags: taskData.tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user?.id || 'anonymous'
      };

      // TODO: Save to database when Supabase is available
      // For now, working in offline mode with local state only
      console.log('📝 Working in offline mode - task saved locally only');

      // Always update local state (works offline)
      setTasks(prev => [...prev, newTask]);
      console.log('✅ Task created successfully (local):', newTask);

    } catch (error) {
      console.error('❌ Failed to create task:', error);
      throw error;
    }
  };

  // Filter tasks based on selected phase
  const getFilteredTasks = () => {
    if (selectedPhase === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === selectedPhase);
  };

  // Get filtered tasks by status for kanban view
  const getFilteredTasksByStatus = () => {
    const filteredTasks = getFilteredTasks();
    return filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<DeliveryTaskStatus, DeliveryTask[]>);
  };

  // Sortable Task Card component
  const SortableTaskCard = ({ task }: { task: DeliveryTask }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white/5 border border-white/10 rounded-lg p-3 mb-3 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing ${
          task.blocked ? 'border-red-400/50 bg-red-500/10' : ''
        } ${isDragging ? 'shadow-lg shadow-black/25' : ''}`}
      >
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
  };

  // Droppable Column component
  const DroppableColumn = ({
    column,
    children
  }: {
    column: { id: DeliveryTaskStatus; title: string; limit?: number };
    children: React.ReactNode;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
    });

    const columnTasks = getColumnTasks(column.id);
    const isLimitExceeded = isWipExceeded(column.id);

    return (
      <div ref={setNodeRef} className="min-h-96">
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

        <div className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-white/5 border border-white/20' : ''
        }`}>
          {children}
        </div>
      </div>
    );
  };

  // Task List View component
  const TaskListView = () => {
    const filteredTasks = getFilteredTasks();

    return (
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">No tasks found</h3>
            <p className="text-white/60 mb-6">
              {selectedPhase === 'all'
                ? 'No tasks in this project yet'
                : `No tasks in ${selectedPhase.replace('_', ' ')} phase`}
            </p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create First Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-medium">{task.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded border border-white/20">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-white/60 text-xs">{task.effort}</span>
                  {task.assignee && (
                    <div className="w-6 h-6 bg-blue-500/30 rounded-full flex items-center justify-center">
                      <span className="text-xs text-blue-200">{task.assignee[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {task.acceptance_criteria.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-white/80 font-medium text-xs mb-2">Acceptance Criteria:</h5>
                  <ul className="text-white/60 text-xs space-y-1">
                    {task.acceptance_criteria.slice(0, 3).map((criteria, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span>
                        {criteria}
                      </li>
                    ))}
                    {task.acceptance_criteria.length > 3 && (
                      <li className="text-white/50">+{task.acceptance_criteria.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="text-xs text-white/50">+{task.tags.length - 3}</span>
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
            </div>
          ))
        )}
      </div>
    );
  };

  const totalWip = tasks.filter(t => ['in_progress', 'review'].includes(t.status)).length;

  // Wrap entire component in error boundary logic
  const renderContent = () => {
    try {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
              <p className="text-white/70">
                {selectedPhase === 'all' ? 'All Tasks' : `${selectedPhase.replace('_', ' ')} Phase`} • {viewMode === 'kanban' ? 'Kanban Board' : 'List View'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-green-500/30 hover:bg-green-500/40 border border-green-400/30 rounded-lg text-green-100 transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Filter and View Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Phase Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm font-medium">Phase:</span>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value as DeliveryTaskStatus | 'all')}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all" className="bg-gray-800 text-white">All Phases</option>
                <option value="ready" className="bg-gray-800 text-white">Ready</option>
                <option value="in_progress" className="bg-gray-800 text-white">In Progress</option>
                <option value="review" className="bg-gray-800 text-white">Review</option>
                <option value="released" className="bg-gray-800 text-white">Released</option>
                <option value="measuring" className="bg-gray-800 text-white">Measuring</option>
              </select>
            </div>

            {/* Task Count */}
            <div className="text-white/70 text-sm">
              <span className="font-medium">Tasks:</span>
              <span className="ml-2">{getFilteredTasks().length}</span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-white/5 rounded-lg border border-white/20 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Kanban</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>List</span>
              </div>
            </button>
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

      {/* Content Area */}
      <div className="p-6">
        {viewMode === 'kanban' ? (
          selectedPhase === 'all' ? (
            // Full Kanban Board View
            <div className="grid grid-cols-5 gap-4">
              {columns.map(column => {
                const columnTasks = getColumnTasks(column.id);

                return (
                  <DroppableColumn key={column.id} column={column}>
                    <SortableContext items={columnTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                      {columnTasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} />
                      ))}
                    </SortableContext>
                  </DroppableColumn>
                );
              })}
            </div>
          ) : (
            // Single Phase Kanban (simplified)
            <div className="max-w-md mx-auto">
              <DroppableColumn column={columns.find(c => c.id === selectedPhase)!}>
                <SortableContext items={getColumnTasks(selectedPhase).map(task => task.id)} strategy={verticalListSortingStrategy}>
                  {getColumnTasks(selectedPhase).map(task => (
                    <SortableTaskCard key={task.id} task={task} />
                  ))}
                </SortableContext>
              </DroppableColumn>
            </div>
          )
        ) : (
          // List View
          <TaskListView />
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && findTaskById(activeId) ? (
          <div className="transform rotate-3">
            <SortableTaskCard task={findTaskById(activeId)!} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        projectId={projectId}
      />
        </div>
        </DndContext>
      );
    } catch (error) {
      console.error('❌ DeliveryFlow render error:', error);
      return (
        <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 ${className}`}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">Delivery Flow Error</h3>
            <p className="text-white/60 mb-4">Something went wrong with the swimming lanes component.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reload Component</span>
            </button>
          </div>
        </div>
      );
    }
  };

  return renderContent();
};

export default DeliveryFlow;