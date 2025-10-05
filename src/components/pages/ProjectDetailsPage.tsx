import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { useVoiceCommands } from '../../contexts/VoiceCommandsContext';
import TaskModal from '../tasks/TaskModal';
import TaskList from '../tasks/TaskList';
import type { Project, Task } from '../../types';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleVoiceCommands } = useVoiceCommands();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Task modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter states
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');

  // Pro/Admin users have full access to voice features
  const hasVoiceAccess = user?.email === 'edovankampen@outlook.com' || user?.email === 'admin@projectflow.com';

  useEffect(() => {
    if (id) {
      loadProject();
      loadTasks();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try Supabase first, fallback to localStorage
      try {
        const { ProjectService } = await import('../../services/projectService');
        const fetchedProject = await ProjectService.getProject(id!);

        if (fetchedProject) {
          setProject(fetchedProject);
        } else {
          throw new Error('Project not found in database');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using localStorage:', supabaseError);

        // Fallback to localStorage
        const localProjectsJson = localStorage.getItem('projectflow_projects');
        const localProjects = localProjectsJson ? JSON.parse(localProjectsJson) : [];
        const foundProject = localProjects.find((p: any) => p.id.toString() === id);

        if (foundProject) {
          // Transform localStorage format to match expected format
          const transformedProject: Project = {
            id: foundProject.id.toString(),
            title: foundProject.name || foundProject.title,
            description: foundProject.description || '',
            status: foundProject.status || 'planning',
            progress: foundProject.progress || 0,
            start_date: foundProject.start_date || null,
            due_date: foundProject.dueDate || foundProject.due_date || null,
            tags: foundProject.tags || [],
            created_at: foundProject.createdAt || new Date().toISOString(),
            updated_at: foundProject.updatedAt || new Date().toISOString(),
            user_id: foundProject.createdBy || 'anonymous',
            team_members: [],
            ai_generated: false,
            metadata: {
              priority: foundProject.priority || 'medium',
              created_via: 'localStorage'
            }
          };
          setProject(transformedProject);
        } else {
          throw new Error('Project not found');
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Project not found');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setTasksLoading(true);

      // Try Supabase first, fallback to localStorage
      try {
        const { TaskService } = await import('../../services/taskService');
        const fetchedTasks = await TaskService.getTasks(id!);
        setTasks(fetchedTasks);
      } catch (supabaseError) {
        console.log('⚠️ Task loading from Supabase failed, using localStorage:', supabaseError);

        // For now, use empty tasks if Supabase fails
        // In a real app, you might want to implement localStorage tasks too
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const { TaskService } = await import('../../services/taskService');
      const createdTask = await TaskService.createTask(taskData);

      if (createdTask) {
        setTasks(prev => [...prev, createdTask]);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { TaskService } = await import('../../services/taskService');
      const result = await TaskService.updateTask(updatedTask.id, updatedTask);

      if (result) {
        setTasks(prev =>
          prev.map(task => task.id === updatedTask.id ? result : task)
        );
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { TaskService } = await import('../../services/taskService');
      const success = await TaskService.deleteTask(taskId);

      if (success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await handleUpdateTask({ ...editingTask, ...taskData } as Task);
    } else {
      await handleCreateTask(taskData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-100';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-100';
      case 'behind':
        return 'bg-red-500/20 text-red-100';
      case 'on_hold':
        return 'bg-gray-500/20 text-gray-100';
      default:
        return 'bg-yellow-500/20 text-yellow-100';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.status === taskFilter;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/80">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-8 text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <Link
            to="/projects"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* LEFT: Logo */}
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-white">ProjectFlow</span>
              </Link>
            </div>

            {/* LEFT NAVIGATION */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <Link
                to="/dashboard"
                className="text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="text-white hover:text-white transition-colors px-3 py-2 rounded-lg font-medium bg-white/20"
              >
                Projects
              </Link>
            </div>

            {/* CENTER: Voice Microphone */}
            {hasVoiceAccess && (
              <div className="flex-1 flex justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleVoiceCommands();
                  }}
                  className="relative px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 bg-white/30 border-2 border-white/40 hover:bg-white/40 hover:border-white/60 shadow-lg"
                  title="🎤 Click to open voice commands menu"
                >
                  <svg
                    className="w-5 h-5 transition-all duration-300 text-white drop-shadow-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* RIGHT NAVIGATION */}
            <div className="flex items-center space-x-6">
              <Link
                to="/team"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
              >
                Team
              </Link>
              <Link
                to="/profile"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
              >
                Profile
              </Link>
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/projects"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Projects</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
              <p className="text-white/80 mb-4">{project.description}</p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
                {project.due_date && (
                  <span className="text-white/70 text-sm">
                    Due: {new Date(project.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">{project.progress}%</div>
              <div className="text-white/70 text-sm">Complete</div>
              <div className="w-32 bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="h-2 bg-white rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Management Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Tasks</h2>
              <div className="flex items-center space-x-4 text-sm text-white/70">
                <span>Total: {taskStats.total}</span>
                <span>Completed: {taskStats.completed}</span>
                <span>In Progress: {taskStats.inProgress}</span>
                <span>To Do: {taskStats.todo}</span>
              </div>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Task</span>
            </button>
          </div>

          {/* Task Filters */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: 'all', label: 'All', count: taskStats.total },
              { key: 'todo', label: 'To Do', count: taskStats.todo },
              { key: 'in_progress', label: 'In Progress', count: taskStats.inProgress },
              { key: 'completed', label: 'Completed', count: taskStats.completed },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setTaskFilter(filter.key as any)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  taskFilter === filter.key
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Task List */}
          <TaskList
            tasks={filteredTasks}
            onTaskUpdate={handleUpdateTask}
            onTaskDelete={handleDeleteTask}
            onTaskEdit={handleEditTask}
            loading={tasksLoading}
          />
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        projectId={project.id}
        task={editingTask}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      />
    </div>
  );
};

export default ProjectDetailsPage;