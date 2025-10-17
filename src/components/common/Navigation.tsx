import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface NavigationProps {
  activeSection?: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = () => {
    navigate('/');
  };


  const isActive = (path: string) => {
    if (activeSection) {
      return activeSection === path;
    }
    return location.pathname === path;
  };

  return (
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

          {/* RIGHT NAVIGATION - All buttons on the right */}
          <div className="flex items-center space-x-4 ml-auto">
            <Link
              to="/home"
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/home')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/projects') || location.pathname.startsWith('/projects/')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Projects
            </Link>
            <Link
              to="/team"
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/team')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Team
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Profile
            </Link>
            <Link
              to="/design-system"
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/design-system')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Design System
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;