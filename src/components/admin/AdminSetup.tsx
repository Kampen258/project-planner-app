import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const { createAdminAccount } = useAuth();

  const createAdmin = async () => {
    setIsCreating(true);
    setMessage('');

    try {
      const adminEmail = 'edovankampen@outlook.com';
      const adminPassword = 'AdminPassword123!'; // You should change this

      const { error } = await createAdminAccount(adminEmail, adminPassword);

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Admin account created/signed in successfully for ${adminEmail}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Setup</h2>

        <div className="space-y-4">
          <p className="text-white/80 text-center">
            Click the button below to create an admin account for edovankampen@outlook.com
          </p>

          <button
            onClick={createAdmin}
            disabled={isCreating}
            className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded-xl font-medium py-3 transition-all duration-300 border border-white/30 backdrop-blur-md"
          >
            {isCreating ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>

          {message && (
            <div className={`p-4 rounded-xl ${
              message.includes('Error')
                ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                : 'bg-green-500/20 border border-green-400/30 text-green-200'
            } backdrop-blur-md`}>
              {message}
            </div>
          )}

          <div className="text-white/60 text-sm">
            <p>Default admin credentials:</p>
            <p>Email: edovankampen@outlook.com</p>
            <p>Password: AdminPassword123!</p>
            <p className="mt-2 text-yellow-200">Please change the password after first login!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;