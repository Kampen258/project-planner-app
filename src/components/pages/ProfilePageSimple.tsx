import React from 'react';
import Navigation from '../layout/Navigation';

const ProfilePageSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-white">Profile Page Works!</h1>
        <p className="text-white/80 mt-4">This is a simple profile page to test routing.</p>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
          <p className="text-white/80 mt-4">Demo User</p>
          <p className="text-white/60">demo@projectflow.com</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSimple;