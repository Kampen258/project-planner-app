import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-white">ProjectFlow</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/projects"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Projects
              </Link>
              <Link
                to="/team"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Team
              </Link>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/80">Welcome back! Here's an overview of your projects.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-white/70 text-sm">2 on track, 1 behind</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Tasks Due Today</h3>
            <p className="text-3xl font-bold text-white">7</p>
            <p className="text-white/70 text-sm">5 completed</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Team Members</h3>
            <p className="text-3xl font-bold text-white">12</p>
            <p className="text-white/70 text-sm">8 active today</p>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Projects</h2>

          <div className="space-y-4">
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">Mobile App Redesign</h3>
                  <p className="text-white/70 text-sm">Design and development project</p>
                </div>
                <span className="bg-green-500/20 text-green-100 px-2 py-1 rounded-full text-xs">
                  On Track
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white/50 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">Website Launch</h3>
                  <p className="text-white/70 text-sm">Marketing website development</p>
                </div>
                <span className="bg-yellow-500/20 text-yellow-100 px-2 py-1 rounded-full text-xs">
                  Behind
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Progress</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-yellow-400/50 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">API Integration</h3>
                  <p className="text-white/70 text-sm">Backend service integration</p>
                </div>
                <span className="bg-blue-500/20 text-blue-100 px-2 py-1 rounded-full text-xs">
                  Planning
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Progress</span>
                  <span>15%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-blue-400/50 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/projects"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-3 hover:bg-white/15 transition-all duration-300 inline-block"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;