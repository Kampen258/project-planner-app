// Dashboard KPI - Redesigned with Essential Project Management KPIs
// Maintains glassmorphism design system with comprehensive reporting

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import Navigation from '../common/Navigation';

const DashboardKPI: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('current_sprint');
  const [selectedProject, setSelectedProject] = useState('all');
  const [isListening, setIsListening] = useState(false);

  const handleSignOut = () => {
    navigate('/');
  };

  // Voice access for admin users
  const hasVoiceAccess = user?.email === 'edovankampen@outlook.com' || user?.email === 'admin@projectflow.com';

  const handleVoiceActivation = () => {
    console.log('🎤 Voice activation initiated');
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();

        // Voice command processing
        if (transcript.includes('show projects')) {
          navigate('/projects');
        } else if (transcript.includes('show team')) {
          navigate('/team');
        } else {
          alert(`🎤 Voice command: "${transcript}"\n\nTry: "show projects", "show team"`);
        }
      };

      recognition.start();
    }
  };

  // Mock data for KPI reports
  const kpiData = {
    sprintBurndown: {
      planned: [40, 35, 25, 18, 10, 5, 0],
      actual: [40, 38, 30, 22, 15, 8, 3],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    velocity: {
      sprints: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5'],
      storyPoints: [23, 28, 25, 32, 29],
      average: 27.4
    },
    issueMetrics: {
      created: 45,
      resolved: 38,
      inProgress: 12,
      backlog: 156
    },
    cycleTime: {
      average: 4.2,
      p50: 3.1,
      p90: 8.5,
      throughput: 8.3
    },
    teamMetrics: {
      members: [
        { name: 'Alice', issues: 12, completed: 8, inProgress: 4 },
        { name: 'Bob', issues: 15, completed: 11, inProgress: 4 },
        { name: 'Charlie', issues: 8, completed: 6, inProgress: 2 },
        { name: 'Diana', issues: 10, completed: 9, inProgress: 1 }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <Navigation activeSection="/dashboard" />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Header with Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Project Dashboard</h1>
            <p className="text-white/70">Real-time insights and KPI tracking</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            {/* Timeframe Filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="current_sprint">Current Sprint</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_quarter">This Quarter</option>
              <option value="last_quarter">Last Quarter</option>
            </select>

            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">All Projects</option>
              <option value="mobile_app">Mobile App Redesign</option>
              <option value="website">Website Launch</option>
              <option value="api">API Integration</option>
            </select>
          </div>
        </div>

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Sprint Progress */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Sprint Progress</h3>
              <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Completed</span>
                <span className="text-white font-medium">27/30 SP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <p className="text-xs text-white/60">3 days remaining</p>
            </div>
          </div>

          {/* Team Velocity */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Team Velocity</h3>
              <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{kpiData.velocity.average}</div>
              <p className="text-white/70 text-sm">Story Points/Sprint</p>
              <p className="text-xs text-green-300">+12% from last sprint</p>
            </div>
          </div>

          {/* Issue Resolution */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Issue Resolution</h3>
              <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Created</span>
                <span className="text-white font-medium">{kpiData.issueMetrics.created}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Resolved</span>
                <span className="text-white font-medium">{kpiData.issueMetrics.resolved}</span>
              </div>
              <p className="text-xs text-orange-300">7 issues backlog growth</p>
            </div>
          </div>

          {/* Cycle Time */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Avg Cycle Time</h3>
              <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{kpiData.cycleTime.average}d</div>
              <p className="text-white/70 text-sm">Days to complete</p>
              <p className="text-xs text-green-300">-0.8d from last sprint</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Sprint Burndown Chart */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Sprint Burndown</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white/70 text-sm">Planned</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white/70 text-sm">Actual</span>
                </div>
              </div>
            </div>

            {/* Simple SVG Chart */}
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Planned line (ideal) */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points="50,40 110,60 170,100 230,120 290,140 350,160 380,180"
                />

                {/* Actual line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  points="50,40 110,50 170,80 230,110 290,130 350,150 380,170"
                />

                {/* Y-axis labels */}
                <text x="20" y="45" fill="rgba(255,255,255,0.7)" fontSize="12">40</text>
                <text x="20" y="105" fill="rgba(255,255,255,0.7)" fontSize="12">20</text>
                <text x="20" y="165" fill="rgba(255,255,255,0.7)" fontSize="12">0</text>

                {/* X-axis labels */}
                {kpiData.sprintBurndown.days.map((day, index) => (
                  <text key={day} x={50 + (index * 50)} y="195" fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="middle">
                    {day}
                  </text>
                ))}
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/70">Scope Change</p>
                <p className="text-white font-medium">+2 Story Points</p>
              </div>
              <div>
                <p className="text-white/70">Completion Trend</p>
                <p className="text-green-300 font-medium">On Track</p>
              </div>
            </div>
          </div>

        </div>

        {/* Second Row - Velocity & Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Velocity Chart */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Team Velocity Trend</h3>

            {/* Velocity Bar Chart */}
            <div className="space-y-3">
              {kpiData.velocity.sprints.map((sprint, index) => {
                const points = kpiData.velocity.storyPoints[index];
                const width = (points / Math.max(...kpiData.velocity.storyPoints)) * 100;
                const isCurrentSprint = index === kpiData.velocity.sprints.length - 1;

                return (
                  <div key={sprint} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`${isCurrentSprint ? 'text-white font-medium' : 'text-white/70'}`}>
                        {sprint}
                      </span>
                      <span className="text-white font-medium">{points} SP</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${isCurrentSprint ? 'bg-blue-500' : 'bg-white/40'}`}
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Average Velocity</span>
                <span className="text-white font-bold">{kpiData.velocity.average} SP</span>
              </div>
            </div>
          </div>

          {/* Team Workload Distribution */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Team Workload Distribution</h3>

            <div className="space-y-4">
              {kpiData.teamMetrics.members.map((member) => {
                const completionRate = (member.completed / member.issues) * 100;
                return (
                  <div key={member.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{member.name}</span>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-300">{member.completed}</span>
                        <span className="text-white/50">/</span>
                        <span className="text-white/70">{member.issues}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/60 w-10 text-right">
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">45</div>
                <div className="text-xs text-white/60">Total Issues</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-300">34</div>
                <div className="text-xs text-white/60">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-300">11</div>
                <div className="text-xs text-white/60">In Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - Risk Matrix & Issue Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Risk & Issue Matrix */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Risk & Issue Matrix</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <div>
                  <div className="text-white font-medium">API Integration Delays</div>
                  <div className="text-red-300 text-sm">High Impact • High Probability</div>
                </div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div>
                  <div className="text-white font-medium">Resource Availability</div>
                  <div className="text-yellow-300 text-sm">Medium Impact • Medium Probability</div>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <div>
                  <div className="text-white font-medium">Testing Environment</div>
                  <div className="text-green-300 text-sm">Low Impact • Low Probability</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button className="bg-white/10 border border-white/20 rounded-lg text-white px-4 py-2 hover:bg-white/15 transition-colors text-sm">
                View Full Risk Register
              </button>
            </div>
          </div>

          {/* Cycle Time & Throughput */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Cycle Time Analysis</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">{kpiData.cycleTime.average}d</div>
                <div className="text-white/70 text-sm">Average</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">{kpiData.cycleTime.p50}d</div>
                <div className="text-white/70 text-sm">Median (P50)</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">{kpiData.cycleTime.p90}d</div>
                <div className="text-white/70 text-sm">P90</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">{kpiData.cycleTime.throughput}</div>
                <div className="text-white/70 text-sm">Throughput/Week</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">To Do → In Progress</span>
                <span className="text-white">0.5d</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">In Progress → Review</span>
                <span className="text-white">2.1d</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Review → Done</span>
                <span className="text-white">1.6d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardKPI;