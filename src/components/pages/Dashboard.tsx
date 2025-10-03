import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Navigation from '../layout/Navigation';

const Dashboard: React.FC = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user.email}!
          </h1>
          <p className="text-white/80 text-lg">
            Here's an overview of your projects and progress.
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Projects Overview */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Projects</h2>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">0</div>
              <div className="text-white/70">Active projects</div>
            </div>
          </div>

          {/* Tasks Overview */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Tasks</h2>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">0</div>
              <div className="text-white/70">Pending tasks</div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Progress</h2>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">0%</div>
              <div className="text-white/70">Overall completion</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/projects/new"
              className="bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 text-center font-medium"
            >
              New Project
            </Link>
            <Link
              to="/projects"
              className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md text-white px-6 py-4 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30 text-center font-medium"
            >
              All Projects
            </Link>
            <Link
              to="/team"
              className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 backdrop-blur-md text-white px-6 py-4 rounded-xl hover:from-green-500/30 hover:to-cyan-500/30 transition-all duration-300 border border-green-400/30 text-center font-medium"
            >
              Team
            </Link>
            <Link
              to="/calendar"
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md text-white px-6 py-4 rounded-xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 border border-orange-400/30 text-center font-medium"
            >
              Calendar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;