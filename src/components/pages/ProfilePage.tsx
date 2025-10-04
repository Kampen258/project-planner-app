import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../layout/Navigation';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  profilePicture: string;
}

interface AccountSettings {
  notifications: {
    email: boolean;
    desktop: boolean;
    mobile: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showEmail: boolean;
    allowMessages: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logging
  console.log('ProfilePage render - user:', user);

  // If user is null, show loading or error state
  if (!user) {
    console.log('No user found, showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.user_metadata?.first_name || 'Demo',
    lastName: user?.user_metadata?.last_name || 'User',
    email: user?.email || 'demo@projectflow.com',
    bio: 'I love using ProjectFlow to manage my projects and stay organized!',
    location: 'San Francisco, CA',
    website: 'https://projectflow.demo',
    profilePicture: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    notifications: {
      email: true,
      desktop: true,
      mobile: false
    },
    privacy: {
      profilePublic: true,
      showEmail: false,
      allowMessages: true
    },
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC'
    }
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 border-2 border-white/30">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition-all duration-300 mb-2"
            >
              Change Picture
            </button>
            <p className="text-white/60 text-sm">JPG, PNG or GIF. Max size 5MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">Personal Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition-all duration-300"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
            <textarea
              rows={4}
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md resize-none disabled:opacity-50"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                disabled={!isEditing}
                placeholder="City, Country"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md disabled:opacity-50"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded-xl font-medium transition-all duration-300 border border-white/30"
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-8">
      {/* Notification Settings */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Notifications</h3>
        <div className="space-y-4">
          {Object.entries(accountSettings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-white/80 capitalize">
                {key === 'email' ? 'Email Notifications' :
                 key === 'desktop' ? 'Desktop Notifications' :
                 'Mobile Push Notifications'}
              </label>
              <button
                onClick={() => setAccountSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, [key]: !value }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Privacy</h3>
        <div className="space-y-4">
          {Object.entries(accountSettings.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-white/80">
                {key === 'profilePublic' ? 'Make Profile Public' :
                 key === 'showEmail' ? 'Show Email Address' :
                 'Allow Direct Messages'}
              </label>
              <button
                onClick={() => setAccountSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, [key]: !value }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Preferences</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Theme</label>
            <select
              value={accountSettings.preferences.theme}
              onChange={(e) => setAccountSettings(prev => ({
                ...prev,
                preferences: { ...prev.preferences, theme: e.target.value as 'light' | 'dark' | 'auto' }
              }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-md"
            >
              <option value="light" className="bg-gray-800">Light</option>
              <option value="dark" className="bg-gray-800">Dark</option>
              <option value="auto" className="bg-gray-800">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Language</label>
            <select
              value={accountSettings.preferences.language}
              onChange={(e) => setAccountSettings(prev => ({
                ...prev,
                preferences: { ...prev.preferences, language: e.target.value }
              }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-md"
            >
              <option value="en" className="bg-gray-800">English</option>
              <option value="es" className="bg-gray-800">Spanish</option>
              <option value="fr" className="bg-gray-800">French</option>
              <option value="de" className="bg-gray-800">German</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Timezone</label>
            <select
              value={accountSettings.preferences.timezone}
              onChange={(e) => setAccountSettings(prev => ({
                ...prev,
                preferences: { ...prev.preferences, timezone: e.target.value }
              }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-md"
            >
              <option value="UTC" className="bg-gray-800">UTC</option>
              <option value="EST" className="bg-gray-800">Eastern Time</option>
              <option value="PST" className="bg-gray-800">Pacific Time</option>
              <option value="CET" className="bg-gray-800">Central European Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 backdrop-blur-md"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded-xl font-medium transition-all duration-300 border border-white/30"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Actions */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Account Actions</h3>
        <div className="space-y-4">
          <button className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-white/60 text-sm">Download your account data</div>
              </div>
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </button>

          <button className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-400/30 text-red-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete Account</div>
                <div className="text-red-300/60 text-sm">Permanently delete your account</div>
              </div>
              <svg className="w-5 h-5 text-red-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Profile & Settings</h1>
          <p className="text-white/80 mt-2 text-lg">Manage your account and preferences</p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-xl backdrop-blur-md">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'account', label: 'Account', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'account' && renderAccountTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </div>
        </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProfilePage rendering error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Profile Error</h2>
          <p className="text-white/80">There was an error loading the profile page.</p>
          <p className="text-white/60 text-sm mt-2">Check the browser console for details.</p>
        </div>
      </div>
    );
  }
};

export default ProfilePage;