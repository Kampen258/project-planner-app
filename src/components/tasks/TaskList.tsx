import React, { useState } from 'react';
import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskEdit: (task: Task) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  loading = false
}) => {
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300';
      case 'todo':
        return 'bg-gray-500/20 text-gray-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'todo':
        return 'To Do';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleToggleCompletion = async (task: Task) => {
    const taskId = task.id;
    setUpdatingTasks(prev => new Set(prev).add(taskId));

    try {
      const updatedTask: Task = {
        ...task,
        completed: !task.completed,
        status: !task.completed ? 'completed' : 'todo',
        completed_at: !task.completed ? new Date().toISOString() : null
      };

      await onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setUpdatingTasks(prev => new Set(prev).add(taskId));

    try {
      await onTaskDelete(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/10 border border-white/20 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Tasks Yet</h3>
        <p className="text-white/70">Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isUpdating = updatingTasks.has(task.id);
        const overdue = isOverdue(task);

        return (
          <div
            key={task.id}
            className={`bg-white/10 border rounded-lg p-4 transition-all duration-300 hover:bg-white/15 ${
              overdue ? 'border-red-400/30' : 'border-white/20'
            } ${task.completed ? 'opacity-75' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Completion Checkbox */}
                <button
                  onClick={() => handleToggleCompletion(task)}
                  disabled={isUpdating}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-green-500/30 border-green-400'
                      : 'border-white/30 hover:border-white/50'
                  } ${isUpdating ? 'animate-pulse' : ''}`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>
                      {task.name}
                    </h4>
                    {overdue && (
                      <span className="text-red-300 text-xs bg-red-500/20 px-2 py-1 rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className={`text-sm mb-2 ${task.completed ? 'text-white/40' : 'text-white/70'}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Status */}
                    <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>

                    {/* Priority */}
                    <span className={`px-2 py-1 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority?.toUpperCase()}
                    </span>

                    {/* Due Date */}
                    {task.due_date && (
                      <span className={`px-2 py-1 rounded-full ${
                        overdue ? 'text-red-300 bg-red-500/20' : 'text-white/60 bg-white/10'
                      }`}>
                        Due {formatDate(task.due_date)}
                      </span>
                    )}

                    {/* Assigned To */}
                    {task.assigned_to && (
                      <span className="px-2 py-1 rounded-full text-white/60 bg-white/10">
                        @{task.assigned_to}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 ml-4">
                <button
                  onClick={() => onTaskEdit(task)}
                  disabled={isUpdating}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={isUpdating}
                  className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;