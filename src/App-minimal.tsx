import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple Landing Page without dependencies
function SimpleLandingPage() {
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
              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium">
                Login
              </button>
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
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  console.log('Minimal App component rendering...');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleLandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;