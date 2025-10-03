import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseProjectService } from '../../services/supabaseProjectService';
import Navigation from '../layout/Navigation';
import AIProjectCreation from './AIProjectCreation';
// import { AnalysisResults } from '../../types/index';

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  tags: string[];
}

const ProjectCreation: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [useAIMode, setUseAIMode] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have AI analysis data or markdown file data
  useEffect(() => {
    const state = location.state as {
      analysis?: any;
      fileName?: string;
      fromMarkdown?: boolean;
      projectName?: string;
      description?: string;
      content?: string;
    };

    if (state?.analysis) {
      const { analysis } = state;
      const project = analysis.extraction.project;
      const context = analysis.extraction.context;

      // Pre-populate form with AI-extracted data
      setFormData({
        name: project.title || state.fileName?.replace(/\.[^/.]+$/, '') || '',
        description: project.description || '',
        startDate: context.timeline?.start_date || '',
        endDate: context.timeline?.end_date || '',
        status: 'planning',
        tags: [project.type || 'AI Generated'].filter(Boolean)
      });
      setIsAIGenerated(true);
    } else if (state?.fromMarkdown) {
      // Pre-populate form with markdown file data
      setFormData({
        name: state.projectName || state.fileName?.replace(/\.[^/.]+$/, '') || '',
        description: state.description || '',
        startDate: '',
        endDate: '',
        status: 'planning',
        tags: ['Markdown', 'Imported'].filter(Boolean)
      });
      setIsAIGenerated(true); // Show as AI generated for styling consistency
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ 
          ...prev, 
          tags: [...prev.tags, tagInput.trim()] 
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a project');
      return;
    }

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating project with user:', user);

      if (!user?.id) {
        setError('Invalid user session. Please log out and log in again.');
        return;
      }

      // Validate that user ID is a proper UUID (not mock data like "123")
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        setError('Authentication error: Please log out and sign in again with proper credentials. Visit /admin/setup if you need to create an admin account.');
        console.error('Invalid user ID format:', user.id);
        return;
      }

      const projectData = {
        title: formData.name,
        description: formData.description || undefined,
        start_date: formData.startDate || undefined,
        end_date: formData.endDate || undefined,
        status: formData.status as 'planning' | 'in_progress' | 'completed' | 'on_hold',
        progress: 0,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        user_id: user.id
      };

      console.log('Project data being sent:', projectData);

      const result = await SupabaseProjectService.createProject(projectData);

      if (result) {
        console.log('Project created successfully:', result);
        navigate('/projects');
      } else {
        setError('Failed to create project - no result returned');
      }
    } catch (err: any) {
      console.error('Project creation error:', err);
      setError(`Failed to create project: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAIProjectComplete = (projectData: any) => {
    setFormData({
      name: projectData.name || '',
      description: projectData.description || '',
      startDate: projectData.startDate || '',
      endDate: projectData.endDate || '',
      status: projectData.status || 'planning',
      tags: projectData.tags || []
    });
    setIsAIGenerated(true);
    setUseAIMode(false);
  };

  const handleCancelAI = () => {
    setUseAIMode(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (useAIMode) {
    return (
      <AIProjectCreation
        onComplete={handleAIProjectComplete}
        onCancel={handleCancelAI}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Create New Project</h1>
                <p className="text-white/80 mt-2 text-lg">Set up your project details and get started</p>
              </div>
              <div className="flex items-center space-x-4">
                {isAIGenerated && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-400/30">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-blue-200 text-sm font-medium">AI Generated</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setUseAIMode(true)}
                  className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md px-4 py-2 rounded-xl border border-purple-400/30 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-purple-200 text-sm font-medium">Try AI Assistant</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-md">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 backdrop-blur-md"
                  placeholder="Enter project name"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 backdrop-blur-md resize-none"
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-white mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white backdrop-blur-md"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-white mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white backdrop-blur-md"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white backdrop-blur-md"
                >
                  <option value="planning" className="bg-gray-800 text-white">Planning</option>
                  <option value="in_progress" className="bg-gray-800 text-white">In Progress</option>
                  <option value="on_hold" className="bg-gray-800 text-white">On Hold</option>
                  <option value="completed" className="bg-gray-800 text-white">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-white mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 backdrop-blur-md"
                  placeholder="Type and press Enter to add tags"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 text-white border border-white/30 backdrop-blur-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-white/80 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-6 py-3 bg-white/10 border border-white/30 rounded-xl text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded-xl font-medium transition-all duration-300 border border-white/30 backdrop-blur-md"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreation;