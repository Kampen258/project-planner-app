import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../layout/Navigation';

const ProfilePageFixed: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security'>('profile');

  console.log('ProfilePageFixed rendering - user:', user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Profile & Settings</h1>
          <p className="text-white/80 mt-2 text-lg">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile' },
                  { id: 'account', label: 'Account' },
                  { id: 'security', label: 'Security' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Profile Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value="Demo User"
                      readOnly
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-md"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || 'demo@projectflow.com'}
                      readOnly
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Account Settings</h3>
                <p className="text-white/80">Manage your account preferences and settings.</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Security</h3>
                <p className="text-white/80">Update your security settings and password.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageFixed;