import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage-working';
import Dashboard from './components/pages/Dashboard-enhanced';
import ProjectsPage from './components/pages/ProjectsPage-enhanced';
import TeamPage from './components/pages/TeamPage-enhanced';
import AdminSetup from './components/admin/AdminSetup-working';

// Working Landing Page without AuthContext dependency
function WorkingLandingPage() {
  console.log('WorkingLandingPage rendering...');

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
              <Link
                to="/login"
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium"
              >
                Login
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
            <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-12 py-4 hover:bg-white/15 transition-all duration-300 text-lg font-medium min-w-[280px]">
              Get Started Free
            </button>
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

      {/* Calendar Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-white">Calendar Overview</h2>
            <h3 className="text-2xl font-light text-white/90">October 2025</h3>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="grid grid-cols-7 gap-px mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="p-4 text-center">
                <span className="text-white/80 font-medium text-sm">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {/* Sample calendar days */}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2; // Start from 1st (offset for week start)
              const isCurrentMonth = day >= 1 && day <= 31;
              const hasEvent = [3, 4, 10, 12, 18, 25, 30].includes(day);

              return (
                <div key={i} className="aspect-square border border-white/20 p-3 relative">
                  <span className={`text-sm font-medium ${isCurrentMonth ? 'text-white' : 'text-white/60'}`}>
                    {isCurrentMonth ? day : ''}
                  </span>
                  {hasEvent && (
                    <div className="mt-1">
                      <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">
                        {day === 3 ? 'Project Kickoff' :
                         day === 4 ? 'Design Sprint' :
                         day === 10 ? 'Team Meeting' :
                         day === 12 ? 'Development' :
                         day === 18 ? 'Testing Phase' :
                         day === 25 ? 'Launch Prep' :
                         'Product Launch'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  console.log('Working App component rendering...');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkingLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
      </Routes>
    </Router>
  );
}

export default App;