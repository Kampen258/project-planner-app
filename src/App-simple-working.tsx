import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SimpleAuthProvider, useAuth } from './contexts/SimpleAuthContext';

// Beautiful enhanced landing page
function LandingPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-white">ProjectFlow</span>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-white/90 text-sm">
                  Welcome, {user.name || user.email} {isAdmin() && '👑'}
                </div>
              )}
              <Link
                to="/dashboard"
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Plan. Execute. Succeed.
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into reality with our intuitive project planning platform.
            Organize tasks, track progress, and collaborate seamlessly.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              to="/dashboard"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-12 py-4 hover:bg-white/15 transition-all duration-300 text-lg font-medium min-w-[280px]"
            >
              Get Started Free
            </Link>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-12 py-4 hover:bg-white/15 transition-all duration-300 text-lg font-medium min-w-[280px]">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything you need to succeed</h2>
          <p className="text-white/70 text-lg">Powerful tools designed for modern project management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Task Management</h3>
            <p className="text-white/70">Create, organize, and prioritize tasks with intuitive drag-and-drop interfaces.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Timeline View</h3>
            <p className="text-white/70">Visualize project timelines and dependencies with beautiful Gantt charts.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Team Collaboration</h3>
            <p className="text-white/70">Work together seamlessly with real-time updates and shared workspaces.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user, roles, hasElevatedPrivileges, isAdmin, supabaseAvailable, refreshUserRoles } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Safely import Supabase for data loading
  let supabase: any = null;
  try {
    const supabaseModule = require('../lib/supabase.client');
    supabase = supabaseModule.supabase;
  } catch (error) {
    console.warn('Supabase not available for projects');
  }

  // Load projects from Supabase with fallbacks
  const loadProjects = async () => {
    if (!user?.id || !supabase) {
      setProjects([]);
      return;
    }

    setLoadingProjects(true);
    setProjectsError(null);

    try {
      console.log('🔍 Loading projects from Supabase...');
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('⚠️ Error loading projects:', error.message);
        setProjectsError(`Failed to load projects: ${error.message}`);
        setProjects([]);
      } else {
        console.log('✅ Loaded projects:', projectsData?.length || 0);
        setProjects(projectsData || []);
      }
    } catch (error) {
      console.error('❌ Error in loadProjects:', error);
      setProjectsError('Network error loading projects');
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    if (supabaseAvailable) {
      loadProjects();
    }
  }, [user?.id, supabaseAvailable]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Home</Link>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email} {isAdmin() && '👑'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Email: {user?.email}</p>
              <p className="text-sm text-gray-600">Name: {user?.name || 'Not set'}</p>
              <p className="text-sm text-gray-600">Roles: {roles.join(', ')}</p>
              <p className="text-sm text-gray-600">
                Admin: {hasElevatedPrivileges() ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          </div>

          {/* Projects Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
              {supabaseAvailable && (
                <button
                  onClick={loadProjects}
                  disabled={loadingProjects}
                  className="text-blue-600 text-sm hover:text-blue-800 disabled:text-gray-400"
                >
                  {loadingProjects ? '⟳' : '↻'}
                </button>
              )}
            </div>

            {!supabaseAvailable ? (
              <div className="text-center text-gray-500">
                <p className="text-sm">🎭 Mock Mode</p>
                <p className="text-xs mt-1">Supabase unavailable</p>
              </div>
            ) : loadingProjects ? (
              <div className="text-center text-gray-500">
                <p className="text-sm">Loading projects...</p>
              </div>
            ) : projectsError ? (
              <div className="text-center text-red-500">
                <p className="text-sm">{projectsError}</p>
                <button
                  onClick={loadProjects}
                  className="text-xs text-blue-600 mt-1 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-2">
                {projects.slice(0, 3).map((project: any) => (
                  <div key={project.id} className="border-l-4 border-blue-500 pl-3 py-1">
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      Status: {project.status} • Progress: {project.progress}%
                    </p>
                  </div>
                ))}
                {projects.length > 3 && (
                  <p className="text-xs text-gray-500 mt-2">
                    +{projects.length - 3} more projects
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-sm">No projects yet</p>
                <p className="text-xs mt-1">Create your first project!</p>
              </div>
            )}
          </div>

          {/* System Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <button
                onClick={refreshUserRoles}
                className="text-blue-600 text-sm hover:text-blue-800"
                title="Refresh user roles"
              >
                ↻
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">React: ✅ Working</p>
              <p className="text-sm text-gray-600">Router: ✅ Working</p>
              <p className="text-sm text-gray-600">Auth: ✅ Integrated</p>
              <p className="text-sm text-gray-600">
                Supabase: {supabaseAvailable ? '✅ Connected' : '⚠️ Mock Mode'}
              </p>
              <p className="text-sm text-gray-600">
                Projects: {supabaseAvailable ? (
                  projects.length > 0 ? `✅ ${projects.length} loaded` : '📝 None found'
                ) : '🎭 Mock data'}
              </p>
              <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/projects"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                  <p className="text-sm text-gray-600">Manage your projects</p>
                </div>
              </div>
            </Link>

            <Link
              to="/team"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Team</h3>
                  <p className="text-sm text-gray-600">Collaborate with others</p>
                </div>
              </div>
            </Link>

            <Link
              to="/profile"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-600">Account settings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const { user, supabaseAvailable } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safely import Supabase for data loading
  let supabase: any = null;
  try {
    const supabaseModule = require('../lib/supabase.client');
    supabase = supabaseModule.supabase;
  } catch (error) {
    console.warn('Supabase not available for projects');
  }

  const loadProjects = async () => {
    if (!user?.id || !supabase) {
      setProjects([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(`Failed to load projects: ${error.message}`);
        setProjects([]);
      } else {
        setProjects(projectsData || []);
      }
    } catch (error) {
      setError('Network error loading projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabaseAvailable) {
      loadProjects();
    }
  }, [user?.id, supabaseAvailable]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.name || user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={loadProjects}
            disabled={loading || !supabaseAvailable}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Refresh Projects'}
          </button>
        </div>

        {!supabaseAvailable ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">🎭 Mock Mode - Supabase unavailable</p>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? (
              projects.map((project: any) => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Status: {project.status}</span>
                    <span>Progress: {project.progress}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500">Create your first project to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamPage() {
  const { user, hasElevatedPrivileges } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.name || user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src="https://ui-avatars.com/api/?name=Edo+van+Kampen&background=random"
                alt={user?.name || user?.email}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.name || user?.email}</h3>
                <p className="text-sm text-gray-600">
                  {hasElevatedPrivileges() ? '👑 Admin' : '👤 Team Member'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Project Owner</p>
          </div>

          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <p className="text-gray-500">Invite team members</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Team Collaboration</h3>
          <p className="text-blue-800 mb-4">
            Invite colleagues to collaborate on projects, assign tasks, and track progress together.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Invite Members
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user, roles, isAdmin, supabaseAvailable } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.name || user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <img
                src="https://ui-avatars.com/api/?name=Edo+van+Kampen&background=random"
                alt={user?.name || user?.email}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {roles.map((role) => (
                  <span
                    key={role}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : role === 'moderator'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {role === 'admin' && '👑 '}
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Account Status:</span>
                    <span className="text-green-600">✅ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supabase Connection:</span>
                    <span className={supabaseAvailable ? 'text-green-600' : 'text-yellow-600'}>
                      {supabaseAvailable ? '✅ Connected' : '⚠️ Mock Mode'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Privileges:</span>
                    <span className={isAdmin() ? 'text-green-600' : 'text-gray-500'}>
                      {isAdmin() ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <SimpleAuthProvider>
      <AppContent />
    </SimpleAuthProvider>
  );
}

export default App;