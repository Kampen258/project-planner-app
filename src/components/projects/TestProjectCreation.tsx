import React from 'react';
import { Link } from 'react-router-dom';

const TestProjectCreation: React.FC = () => {
  console.log('🧪 TestProjectCreation component rendering...');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Test Project Creation</h1>
          <p className="text-white/80">This is a test component to debug the blank page issue</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="space-y-4">
            <p className="text-white">✅ Component is rendering successfully!</p>
            <p className="text-white">✅ React Router is working</p>
            <p className="text-white">✅ Tailwind CSS is working</p>

            <div className="mt-6">
              <Link
                to="/projects"
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProjectCreation;