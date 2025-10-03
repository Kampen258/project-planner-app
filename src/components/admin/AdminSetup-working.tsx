import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSetup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Check if Supabase is available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setError('Authentication service is not configured. Please check your environment variables.');
        setLoading(false);
        return;
      }

      // Dynamically import supabase
      const { supabase } = await import('../../lib/supabase');

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            created_at: new Date().toISOString(),
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('User already exists. Try signing in instead.');
        } else {
          setError(authError.message);
        }
      } else {
        setSuccess('Admin account created successfully! You can now sign in.');
        console.log('Admin account created:', data.user?.email);

        // Wait 2 seconds then redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to create admin account. Please try again.');
      console.error('Admin account creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-2xl font-bold text-white">ProjectFlow</span>
          </Link>
        </div>

        {/* Admin Setup Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Admin Account</h2>
          <p className="text-white/70 text-center mb-6">Set up your administrator account to get started</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-100 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                placeholder="admin@yourcompany.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                placeholder="Enter secure password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 hover:bg-white/25 border border-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-white/70 text-sm hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Setup Information</h3>
          <p className="text-white/70 text-sm">
            This will create your first admin account in the Supabase database.
            Make sure to use a secure password and remember these credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;