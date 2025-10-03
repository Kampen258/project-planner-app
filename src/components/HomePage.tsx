

interface HomePageProps {
  onNavigate: (page: 'dashboard' | 'projects') => void
}

export function HomePage({ onNavigate }: HomePageProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            ProjectFlow
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your project management with AI-powered insights,
            beautiful timelines, and seamless collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/30 text-lg font-semibold shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              View Dashboard
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30 text-lg font-semibold shadow-2xl hover:shadow-purple-500/20 hover:scale-105"
            >
              Manage Projects
            </button>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything you need to succeed</h2>
          <p className="text-white/70 text-lg">Powerful features designed to make project management effortless</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Voice Assistant</h3>
            <p className="text-white/70">Talk to Claude naturally - create projects, manage tasks, and get insights using simple voice commands.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Calendar</h3>
            <p className="text-white/70">Integrated Google Calendar sync keeps your schedule aligned with project milestones.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Visual Progress</h3>
            <p className="text-white/70">Beautiful charts and timelines make it easy to track progress and identify bottlenecks.</p>
          </div>
        </div>
      </div>

      {/* Calendar Overview Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-white">Calendar Overview</h2>
            <h3 className="text-2xl font-light text-white/90">October 2025</h3>
          </div>
        </div>

        {/* Glass Calendar Grid */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-px mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="p-4 text-center">
                <span className="text-white/80 font-medium text-sm">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px">
            {/* Week 1 */}
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white/60 text-sm"></span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">1</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">2</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">3</span>
              <div className="mt-1">
                <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Project Kickoff</div>
              </div>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">4</span>
              <div className="mt-1">
                <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Design Sprint</div>
              </div>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">5</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">6</span>
            </div>

            {/* Week 2 */}
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">7</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">8</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">9</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">10</span>
              <div className="mt-1">
                <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Team Meeting</div>
              </div>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">11</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">12</span>
              <div className="mt-1">
                <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Development Phase</div>
              </div>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">13</span>
            </div>

            {/* Week 3 */}
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">14</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">15</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">16</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">17</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">18</span>
              <div className="mt-1">
                <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Testing Phase</div>
              </div>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">19</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">20</span>
            </div>

            {/* Week 4 */}
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">21</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">22</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">23</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">24</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">25</span>
              <div className="mt-1">
                <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Launch Prep</div>
              </div>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">26</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">27</span>
            </div>

            {/* Week 5 */}
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">28</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">29</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">30</span>
              <div className="mt-1">
                <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Product Launch</div>
              </div>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white text-sm font-medium">31</span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white/60 text-sm"></span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white/60 text-sm"></span>
            </div>
            <div className="aspect-square border border-white/20 p-3 relative">
              <span className="text-white/60 text-sm"></span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}