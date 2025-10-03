import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navigation from '../layout/Navigation';

const Dashboard: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [dailyActivities, setDailyActivities] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<{step: string; message: string; detail: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overallProgress: 0
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch tasks (if tasks table exists)
      // const { data: tasksData } = await supabase
      //   .from('tasks')
      //   .select('*')
      //   .eq('user_id', user!.id)
      //   .order('created_at', { ascending: false });

      const projectsArray = projectsData || [];
      setProjects(projectsArray);

      // Calculate stats
      const totalProjects = projectsArray.length;
      const completedProjects = projectsArray.filter(p => p.status === 'completed').length;
      const inProgressProjects = projectsArray.filter(p => p.status === 'in_progress').length;
      const overallProgress = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

      setStats({
        totalProjects,
        completedTasks: completedProjects,
        pendingTasks: inProgressProjects,
        overallProgress
      });

      // Generate recent activity
      const activity = projectsArray.slice(0, 3).map((project, index) => ({
        id: index,
        type: 'project',
        message: `Project "${project.name}" was ${project.status === 'completed' ? 'completed' : 'updated'}`,
        time: new Date(project.updated_at || project.created_at).toLocaleDateString(),
        icon: project.status === 'completed' ? 'check' : 'edit'
      }));
      setRecentActivity(activity);

      // Set initial daily activities for today
      updateDailyActivities(new Date().getDate());

      // Set first project as selected by default
      if (projectsArray.length > 0) {
        setSelectedProject(projectsArray[0]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Sample activities for different dates
  const sampleActivities = {
    3: [
      { id: 1, type: 'meeting', message: 'Project Kickoff Meeting scheduled', time: '9:00 AM', icon: 'calendar' },
      { id: 2, type: 'task', message: 'Review project requirements', time: '2:00 PM', icon: 'check' }
    ],
    7: [
      { id: 3, type: 'review', message: 'Weekly team review completed', time: '10:00 AM', icon: 'check' },
      { id: 4, type: 'update', message: 'Project timeline updated', time: '3:30 PM', icon: 'edit' }
    ],
    15: [
      { id: 5, type: 'sprint', message: 'Sprint planning session', time: '9:30 AM', icon: 'calendar' },
      { id: 6, type: 'task', message: 'Development tasks assigned', time: '11:00 AM', icon: 'edit' },
      { id: 7, type: 'meeting', message: 'Client feedback call', time: '4:00 PM', icon: 'calendar' }
    ],
    22: [
      { id: 8, type: 'demo', message: 'Product demo presentation', time: '2:00 PM', icon: 'check' },
      { id: 9, type: 'feedback', message: 'Feedback collection completed', time: '4:30 PM', icon: 'edit' }
    ],
    28: [
      { id: 10, type: 'launch', message: 'Product launch preparation', time: '8:00 AM', icon: 'check' },
      { id: 11, type: 'meeting', message: 'Launch team final meeting', time: '1:00 PM', icon: 'calendar' }
    ]
  };

  const updateDailyActivities = (day: number) => {
    const activities = sampleActivities[day as keyof typeof sampleActivities] || [];
    setDailyActivities(activities);
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    updateDailyActivities(day);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a markdown file
    if (!file.name.toLowerCase().endsWith('.md')) {
      alert('Please select a markdown (.md) file');
      return;
    }

    setUploadProgress({
      step: 'reading',
      message: 'Reading markdown file...',
      detail: `Processing ${file.name}`
    });

    try {
      // Read file content
      const fileContent = await readFileAsText(file);

      setUploadProgress({
        step: 'processing',
        message: 'Processing content...',
        detail: 'Preparing project data'
      });

      // For now, we'll extract basic project info from the markdown
      // In the future, this could be enhanced with AI analysis
      const projectName = extractProjectName(fileContent, file.name);
      const description = extractDescription(fileContent);

      setUploadProgress({
        step: 'complete',
        message: 'Ready to create project!',
        detail: `Project: ${projectName}`
      });

      // Navigate to project creation with the extracted data
      setTimeout(() => {
        navigate('/projects/new', {
          state: {
            fromMarkdown: true,
            fileName: file.name,
            projectName,
            description,
            content: fileContent
          }
        });
        setUploadProgress(null);
      }, 1500);
    } catch (error) {
      console.error('File processing error:', error);
      setUploadProgress({
        step: 'error',
        message: 'Processing failed',
        detail: 'Please try again or create a project manually'
      });
      setTimeout(() => setUploadProgress(null), 3000);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const extractProjectName = (content: string, fileName: string): string => {
    // Try to find the first h1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Try to find any heading
    const headingMatch = content.match(/^#+\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Fall back to filename without extension
    return fileName.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
  };

  const extractDescription = (content: string): string => {
    // Remove headings and get the first paragraph
    const lines = content.split('\n');
    let description = '';

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and headings
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Found first non-heading content
      if (trimmed.length > 0) {
        description = trimmed;
        break;
      }
    }

    // Limit description length
    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }

    return description || 'Project created from markdown file';
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user.email?.split('@')[0]}!
              </h1>
              <p className="text-white/80 text-lg">
                Here's what's happening with your projects today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white/70 text-sm">Today</div>
                <div className="text-white text-lg font-semibold">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Projects */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
                <div className="text-white/70 text-sm">Total Projects</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Active projects</span>
              <span className="text-green-400 text-sm font-medium">{stats.totalProjects > 0 ? '+' + Math.round((stats.totalProjects / Math.max(stats.totalProjects, 1)) * 100) + '%' : '0%'}</span>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.completedTasks}</div>
                <div className="text-white/70 text-sm">Completed Tasks</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">This week</span>
              <span className="text-green-400 text-sm font-medium">{stats.completedTasks > 0 ? '+' + stats.completedTasks : '0'}</span>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.pendingTasks}</div>
                <div className="text-white/70 text-sm">Pending Tasks</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Due this week</span>
              <span className="text-orange-400 text-sm font-medium">{stats.pendingTasks > 0 ? stats.pendingTasks + ' pending' : '0 urgent'}</span>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">1</div>
                <div className="text-white/70 text-sm">Team Members</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Active users</span>
              <span className="text-green-400 text-sm font-medium">1 online</span>
            </div>
          </div>
        </div>

        {/* Project Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Selector Panel */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Project Selection</h2>
              <button
                onClick={() => fetchDashboardData()}
                className="flex items-center justify-center bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto mb-3"></div>
                <p className="text-white/60 text-sm">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
                <p className="text-white/60 mb-4">Create your first project to get started</p>
                <Link
                  to="/projects/new"
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="project-select" className="block text-sm font-medium text-white mb-2">
                    Select Project
                  </label>
                  <select
                    id="project-select"
                    value={selectedProject?.id || ''}
                    onChange={(e) => {
                      const project = projects.find(p => p.id === e.target.value);
                      setSelectedProject(project);
                    }}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white backdrop-blur-md"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id} className="bg-gray-800 text-white">
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProject && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{selectedProject.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProject.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        selectedProject.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                        selectedProject.status === 'on_hold' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {selectedProject.status.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedProject.description && (
                      <p className="text-white/70 text-sm mb-3">{selectedProject.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Progress</span>
                      <span className="text-white text-sm font-medium">{selectedProject.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedProject.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleUploadClick}
                    className="flex items-center justify-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 border border-green-400/30 text-center font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Markdown
                  </button>
                  <Link
                    to="/projects"
                    className="flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 border border-blue-400/30 text-center font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    View All Progress
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Productivity Tips */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Productivity Tips</h2>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-medium text-sm">Break down large projects</h3>
                  <p className="text-white/60 text-xs mt-1">Divide complex projects into smaller, manageable tasks</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-medium text-sm">Set realistic deadlines</h3>
                  <p className="text-white/60 text-xs mt-1">Allow buffer time for unexpected challenges</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-medium text-sm">Review progress regularly</h3>
                  <p className="text-white/60 text-xs mt-1">Weekly check-ins help maintain momentum and focus</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-medium text-sm">Celebrate milestones</h3>
                  <p className="text-white/60 text-xs mt-1">Acknowledge completed tasks to stay motivated</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Calendar Overview */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Calendar Overview</h2>
              <div className="text-white/70 text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/5 rounded-xl p-4">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center">
                    <span className="text-white/80 font-medium text-xs">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Generate current month calendar */}
                {(() => {
                  const today = new Date();
                  const currentMonth = today.getMonth();
                  const currentYear = today.getFullYear();
                  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
                  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
                  const startingDayOfWeek = firstDayOfMonth.getDay();
                  const daysInMonth = lastDayOfMonth.getDate();
                  const calendarDays = [];

                  // Empty cells for days before the first day of the month
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    calendarDays.push(
                      <div key={`empty-${i}`} className="aspect-square border border-white/10 p-2 relative">
                        <span className="text-white/30 text-xs"></span>
                      </div>
                    );
                  }

                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const isToday = day === today.getDate();
                    const hasEvent = [3, 7, 15, 22, 28].includes(day); // Sample events

                    calendarDays.push(
                      <div
                        key={day}
                        className={`aspect-square border border-white/10 p-2 relative hover:bg-white/20 transition-all duration-200 cursor-pointer ${
                          isToday ? 'bg-white/20' : selectedDate === day ? 'bg-white/15' : ''
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        <span className={`text-xs font-medium ${
                          isToday ? 'text-white' : selectedDate === day ? 'text-white' : 'text-white/80'
                        }`}>{day}</span>
                        {hasEvent && (
                          <div className="mt-1">
                            <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 truncate">
                              {day === 3 ? 'Meeting' : day === 7 ? 'Review' : day === 15 ? 'Sprint' : day === 22 ? 'Demo' : 'Launch'}
                            </div>
                          </div>
                        )}
                        {isToday && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                        {selectedDate === day && !isToday && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    );
                  }

                  return calendarDays;
                })()}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Activity</h2>
                <p className="text-white/60 text-sm mt-1">
                  {selectedDate === new Date().getDate() ? 'Today' : `${new Date().toLocaleDateString('en-US', { month: 'long' })} ${selectedDate}`}
                </p>
              </div>
              <button className="text-white/70 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {loadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto mb-3"></div>
                  <p className="text-white/60 text-xs">Loading activity...</p>
                </div>
              ) : dailyActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">No activities</h3>
                  <p className="text-white/60 text-xs">No activities scheduled for this day</p>
                </div>
              ) : (
                dailyActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.icon === 'check' ? 'bg-green-500/20' :
                      activity.icon === 'calendar' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                    }`}>
                      {activity.icon === 'check' ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : activity.icon === 'calendar' ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-white/50 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Progress Modal */}
        {uploadProgress && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {uploadProgress.step === 'error' ? (
                    <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L5.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : uploadProgress.step === 'complete' ? (
                    <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{uploadProgress.message}</h3>
                <p className="text-white/70 mb-6">{uploadProgress.detail}</p>
                {uploadProgress.step === 'reading' && (
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 w-1/3" />
                  </div>
                )}
                {uploadProgress.step === 'processing' && (
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 w-2/3" />
                  </div>
                )}
                {uploadProgress.step === 'complete' && (
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Overall Progress</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{stats.overallProgress}%</div>
              <div className="text-white/70 text-sm">Completion Rate</div>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-4 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
              <div className="text-white/70 text-sm">Completed</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.pendingTasks}</div>
              <div className="text-white/70 text-sm">In Progress</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
              <div className="text-white/70 text-sm">Total Projects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;