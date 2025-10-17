import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
}

const TaskPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock project data based on projectId
  const [project, setProject] = useState<Project>({
    id: projectId || '1',
    name: `Project ${projectId || '1'}`,
    description: 'A comprehensive project management solution with advanced task tracking.',
    status: 'active'
  });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design System Setup',
      description: 'Create comprehensive design system with components, colors, and typography guidelines',
      status: 'completed',
      priority: 'high',
      assignee: 'Design Team',
      dueDate: '2025-10-15',
      createdAt: '2025-10-01',
      updatedAt: '2025-10-10'
    },
    {
      id: '2',
      title: 'Database Architecture',
      description: 'Design and implement database schema for user management and project data',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Backend Team',
      dueDate: '2025-10-20',
      createdAt: '2025-10-05',
      updatedAt: '2025-10-12'
    },
    {
      id: '3',
      title: 'User Authentication',
      description: 'Implement secure user authentication with JWT tokens and session management',
      status: 'todo',
      priority: 'medium',
      assignee: 'Full Stack Team',
      dueDate: '2025-10-25',
      createdAt: '2025-10-08',
      updatedAt: '2025-10-08'
    },
    {
      id: '4',
      title: 'API Documentation',
      description: 'Create comprehensive API documentation using OpenAPI/Swagger specifications',
      status: 'todo',
      priority: 'medium',
      assignee: 'Backend Team',
      dueDate: '2025-10-30',
      createdAt: '2025-10-10',
      updatedAt: '2025-10-10'
    },
    {
      id: '5',
      title: 'Mobile Responsiveness',
      description: 'Ensure all components work perfectly on mobile devices and tablets',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Frontend Team',
      dueDate: '2025-10-18',
      createdAt: '2025-10-02',
      updatedAt: '2025-10-11'
    },
    {
      id: '6',
      title: 'Performance Optimization',
      description: 'Optimize application performance, lazy loading, and bundle size',
      status: 'todo',
      priority: 'low',
      dueDate: '2025-11-05',
      createdAt: '2025-10-12',
      updatedAt: '2025-10-12'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignee: '',
    dueDate: ''
  });

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-100 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-100 border-blue-500/30';
      case 'todo': return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-100 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-100 border-orange-500/30';
      case 'low': return 'bg-green-500/20 text-green-100 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-500/30';
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: (tasks.length + 1).toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
    setIsAddingTask(false);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-white">ProjectFlow</span>
              </Link>
              <span className="text-white/60">•</span>
              <Link to="/projects" className="text-white/80 hover:text-white transition-colors">
                Projects
              </Link>
              <span className="text-white/60">•</span>
              <span className="text-white font-medium">{project.name}</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/projects"
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium"
              >
                ← Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
              <p className="text-white/80 text-lg mb-4">{project.description}</p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${project.status === 'active' ? 'bg-green-500/20 text-green-100 border-green-500/30' : 'bg-gray-500/20 text-gray-100 border-gray-500/30'}`}>
                  {project.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80">{taskStats.total} tasks</span>
              </div>
            </div>

            <button
              onClick={() => setIsAddingTask(true)}
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-100 px-6 py-3 rounded-xl font-medium transition-all duration-300"
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{taskStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📋
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-200">{taskStats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-blue-200">{taskStats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                🔄
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">To Do</p>
                <p className="text-2xl font-bold text-yellow-200">{taskStats.todo}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                📝
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 mb-6 inline-flex">
          {(['all', 'todo', 'in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === status
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {status === 'all' ? 'All Tasks' :
               status === 'in-progress' ? 'In Progress' :
               status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-white/60 hover:text-red-200 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4 line-clamp-3">{task.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {task.status === 'in-progress' ? 'In Progress' :
                   task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                {task.dueDate && (
                  <span className="text-white/60 text-xs">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {task.assignee && (
                <div className="mb-4">
                  <span className="text-white/60 text-xs">Assigned to: </span>
                  <span className="text-white/80 text-xs">{task.assignee}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <span className="text-white/50 text-xs">
                  Updated {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Modal */}
        {isAddingTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Add New Task</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-24"
                    placeholder="Enter task description..."
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-white/80 text-sm mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-white/80 text-sm mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Assignee</label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Assign to..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-100 px-6 py-2 rounded-lg transition-all duration-300"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPage;