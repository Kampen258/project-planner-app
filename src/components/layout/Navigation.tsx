import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-white">ProjectFlow</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium ${
                isActive('/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium ${
                isActive('/projects') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Projects
            </Link>
            <Link
              to="/team"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium ${
                isActive('/team') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Team
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-white/80 text-sm hidden sm:block">
              {user.email}
            </span>
            <Link
              to="/profile"
              className={`text-white hover:text-white transition-colors px-4 py-2 rounded-lg font-medium bg-blue-500/20 border border-blue-400/30 ${
                isActive('/profile') ? 'bg-blue-500/40' : 'hover:bg-blue-500/30'
              }`}
            >
              👤 Profile
            </Link>
            <button
              onClick={signOut}
              className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <Link
              to="/dashboard"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/projects') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Projects
            </Link>
            <Link
              to="/team"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/team') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Team
            </Link>
            <Link
              to="/profile"
              className={`text-white hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/20 border border-blue-400/30 ${
                isActive('/profile') ? 'bg-blue-500/40' : 'hover:bg-blue-500/30'
              }`}
            >
              👤 Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;