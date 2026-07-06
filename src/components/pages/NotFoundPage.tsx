import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 max-w-lg w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Page not found</h2>
        <p className="text-white/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/projects"
            className="px-6 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            View Projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
