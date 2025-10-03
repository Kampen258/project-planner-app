import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Navigation from '../layout/Navigation';
// import { aiService } from '../../services/aiService';
// import { ProgressUpdate } from '../../types/index';

const ProjectsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState<{step: string; message: string; detail: string}>({
    step: 'reading',
    message: 'Starting analysis...',
    detail: ''
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setShowProgress(true);

    try {
      // Read file content
      const fileContent = await readFileAsText(file);

      // Analyze document with AI
      const analysis = await aiService.analyzeDocument(
        fileContent,
        user!.id,
        setProgress
      );

      // Navigate to project creation with analysis results
      navigate('/projects/new', {
        state: {
          analysis,
          fileName: file.name
        }
      });
    } catch (error) {
      console.error('File analysis error:', error);
      setProgress({
        step: 'error',
        message: 'Analysis failed',
        detail: 'Please try again or create a project manually'
      });
      setTimeout(() => setShowProgress(false), 3000);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const getProgressPercent = (): string => {
    switch (progress.step) {
      case 'reading': return '25%';
      case 'analyzing': return '75%';
      case 'complete': return '100%';
      default: return '0%';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
              <p className="text-white/80 text-lg">Manage and track your projects</p>
            </div>
            <Link
              to="/projects/new"
              className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 font-medium"
            >
              New Project
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">No projects yet</h3>
            <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">Get started by creating your first project and begin organizing your workflow</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/projects/new"
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Project
              </Link>
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md text-white rounded-xl hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 border border-blue-400/30 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Document
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md text-white rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30 font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Progress Modal */}
        {showProgress && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-8h-4M6 12H2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{progress.message}</h3>
                <p className="text-white/70 mb-6">{progress.detail}</p>
                {progress.step !== 'complete' && (
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: getProgressPercent() }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectsPage;