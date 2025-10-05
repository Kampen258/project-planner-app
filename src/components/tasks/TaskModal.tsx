import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SimpleAuthContext';
import type { Task } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  projectId: string;
  task?: Task | null; // For editing existing tasks
  title?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  task = null,
  title = 'Create Task'
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'completed' | 'cancelled',
    due_date: '',
    assigned_to: ''
  });

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        setFormData({
          name: task.name || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          due_date: task.due_date || '',
          assigned_to: task.assigned_to || ''
        });
      } else {
        // Creating new task
        setFormData({
          name: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          due_date: '',
          assigned_to: ''
        });
      }
      setError(null);
    }
  }, [isOpen, task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Task name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskData: Partial<Task> = {
        ...formData,
        project_id: projectId,
        user_id: user?.id || 'anonymous',
        order_index: task?.order_index || 0,
      };

      if (task) {
        // Editing existing task
        taskData.id = task.id;
      }

      await onSave(taskData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label htmlFor="name" className="block text-white font-medium text-sm mb-2">
              Task Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50"
              placeholder="Enter task name"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-white font-medium text-sm mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50 resize-none"
              placeholder="Describe the task (optional)"
              disabled={loading}
            />
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-white font-medium text-sm mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                disabled={loading}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-white font-medium text-sm mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                disabled={loading}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-white font-medium text-sm mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
              disabled={loading}
            />
          </div>

          {/* Assigned To */}
          <div>
            <label htmlFor="assigned_to" className="block text-white font-medium text-sm mb-2">
              Assigned To
            </label>
            <input
              type="text"
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50"
              placeholder="Enter assignee email or name"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-3 hover:bg-white/15 transition-all duration-300 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                loading || !formData.name.trim()
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-blue-500/30 text-blue-100 hover:bg-blue-500/40 border border-blue-400/30'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>{task ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;