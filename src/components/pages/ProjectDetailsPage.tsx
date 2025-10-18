import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
// import { useVoiceCommands } from '../../contexts/VoiceCommandsContext'; // Temporarily disabled
// Task components removed - now using New Agile components
import DiscoveryPipeline from '../newAgile/DiscoveryPipeline';
import DeliveryFlowWorking from '../newAgile/DeliveryFlowWorking';
import OKRManagement from '../newAgile/OKRManagement';
import DiscoveryLog from '../newAgile/DiscoveryLog';
import UserPersonas from '../newAgile/UserPersonas';
import DecisionLog from '../newAgile/DecisionLog';
import OpportunityModal from '../newAgile/OpportunityModal';
import Navigation from '../common/Navigation';
import { NewAgileService } from '../../services/newAgileService';
import type { Project, Task, OpportunityCreateRequest } from '../../types';
import type { OpportunityCreateRequest as NewAgileOpportunityCreateRequest } from '../../types/newAgile';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  // const { toggleVoiceCommands } = useVoiceCommands(); // Temporarily disabled

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Task modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Opportunity modal states
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);

  // Filter states
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'discovery' | 'delivery' | 'okrs' | 'insights' | 'personas' | 'decisions'>('discovery');

  // Discovery sub-tab state
  const [discoveryTab, setDiscoveryTab] = useState<'opportunities' | 'hypotheses' | 'experiments'>('opportunities');

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

  const handleSaveOpportunity = async (opportunityData: NewAgileOpportunityCreateRequest) => {
    try {
      console.log('Saving opportunity:', opportunityData);

      const result = await NewAgileService.createOpportunity(
        opportunityData,
        id!,
        user?.id || 'anonymous'
      );

      if (result) {
        console.log('✅ Opportunity saved successfully:', result);
        setShowOpportunityModal(false);
        // TODO: Refresh opportunities list after successful creation
      } else {
        throw new Error('Failed to create opportunity');
      }
    } catch (error) {
      console.error('❌ Failed to save opportunity:', error);
      throw error;
    }
  };

  const renderActiveTabContent = () => {
    if (!id) return null;

    switch (activeTab) {
      case 'discovery':
        return <DiscoveryPipeline projectId={id} />;
      case 'delivery':
        return (
          <DeliveryFlowWorking
            projectId={id}
            projectName={project?.name}
            tasks={tasks}
            onTaskCreate={handleCreateTask}
            onTaskUpdate={handleUpdateTask}
          />
        );
      case 'okrs':
        return <OKRManagement projectId={id} />;
      case 'insights':
        return <DiscoveryLog projectId={id} />;
      case 'personas':
        return <UserPersonas projectId={id} />;
      case 'decisions':
        return <DecisionLog projectId={id} />;
      default:
        return <DiscoveryPipeline projectId={id} />;
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
      <Navigation />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/projects"
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 inline-flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Projects</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">{project.title}</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 mb-8">
          <div className="flex space-x-1">
            {[
              {
                key: 'discovery',
                label: 'Discovery',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                key: 'delivery',
                label: 'Delivery',
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 8V7c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h1.2c.4 1.7 2 3 3.8 3s3.4-1.3 3.8-3h1.4c.4 1.7 2 3 3.8 3s3.4-1.3 3.8-3H22v-4l-3-3h-2zM8 17c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm9-9h1.5l1.5 1.5V11H17V8zm0 9c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                  </svg>
                )
              },
              {
                key: 'okrs',
                label: 'OKRs',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                )
              },
              {
                key: 'insights',
                label: 'Insights',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                key: 'personas',
                label: 'Personas',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                key: 'decisions',
                label: 'Decisions',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderActiveTabContent()}
        </div>
      </div>

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={showOpportunityModal}
        onClose={() => setShowOpportunityModal(false)}
        onSave={handleSaveOpportunity}
        projectId={id!}
      />
    </div>
  );
};

export default ProjectDetailsPage;