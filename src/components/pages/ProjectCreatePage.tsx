import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { useVoiceCommands } from '../../contexts/VoiceCommandsContext';
import Navigation from '../common/Navigation';
import BraindumpOrchestrator from '../braindump/BraindumpOrchestrator';

interface ProjectFormData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planning' | 'in_progress' | 'behind' | 'completed' | 'on_hold';
  dueDate: string;
  budget: string;
}

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleVoiceCommands } = useVoiceCommands();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [creationMethod, setCreationMethod] = useState<'choice' | 'braindump' | 'manual'>('choice');

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    priority: 'medium',
    status: 'planning',
    dueDate: '',
    budget: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try Supabase first, fallback to localStorage
      try {
        // Import ProjectService dynamically to avoid initialization issues
        const { ProjectService } = await import('../../services/projectService');

        // Create project in Supabase
        const projectData = {
          title: formData.name,
          description: formData.description,
          status: formData.status,
          user_id: user?.id || 'anonymous',
          metadata: {
            priority: formData.priority,
            created_via: 'simple_form'
          }
        };

        const createdProject = await ProjectService.createProject(projectData);

        if (createdProject) {
          console.log('✅ Project created in Supabase:', createdProject.title);
        } else {
          throw new Error('Supabase creation failed');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using localStorage:', supabaseError);

        // Fallback to localStorage
        const existingProjectsJson = localStorage.getItem('projectflow_projects');
        const existingProjects = existingProjectsJson ? JSON.parse(existingProjectsJson) : [];

        const newProject = {
          id: Date.now(),
          ...formData,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user?.email || 'anonymous'
        };

        const updatedProjects = [...existingProjects, newProject];
        localStorage.setItem('projectflow_projects', JSON.stringify(updatedProjects));
      }

      // Show success message
      setSuccessMessage(`Project "${formData.name}" created successfully!`);

      // Reset form
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        status: 'planning',
        dueDate: '',
        budget: ''
      });

      // Navigate back to projects after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 2000);

    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle braindump choice
  const handleBraindumpChoice = () => {
    setCreationMethod('braindump');
  };

  const handleManualChoice = () => {
    setCreationMethod('manual');
  };

  const handleBackToChoice = () => {
    setCreationMethod('choice');
  };

  // If braindump method is selected, render the braindump orchestrator
  if (creationMethod === 'braindump') {
    return <BraindumpOrchestrator />;
  }

  // If choice screen, show the two options
  if (creationMethod === 'choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                to="/projects"
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Projects</span>
              </Link>
            </div>
            <h2 className="text-3xl font-bold text-white text-center mb-2">Create New Project</h2>
            <p className="text-white/80 text-center">Choose how you'd like to create your project</p>
          </div>

          {/* Options */}
          <div className="p-8 space-y-6">
            {/* Upload Document Option */}
            <button
              onClick={handleBraindumpChoice}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <span className="text-2xl">📄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Upload Document</h3>
                  <p className="text-white/80 mb-3">Let AI analyze your file and build your project automatically</p>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <span>• Supports .txt, .md files</span>
                    <span>• AI extracts tasks & features</span>
                    <span>• Smart project organization</span>
                  </div>
                </div>
                <div className="text-white/60 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Start from Scratch Option */}
            <button
              onClick={handleManualChoice}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <span className="text-2xl">✏️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Start from Scratch</h3>
                  <p className="text-white/80 mb-3">Create your project manually with a simple form</p>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <span>• Quick setup</span>
                    <span>• Full control</span>
                    <span>• Traditional approach</span>
                  </div>
                </div>
                <div className="text-white/60 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBackToChoice}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Options</span>
            </button>
            <Link
              to="/projects"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>All Projects</span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-white/80">Set up your project details and start managing your work</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-100 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Project Creation Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-white font-medium text-sm mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50"
                placeholder="Enter project name"
              />
            </div>

            {/* Project Description */}
            <div>
              <label htmlFor="description" className="block text-white font-medium text-sm mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50 resize-none"
                placeholder="Describe your project goals and objectives"
              />
            </div>

            {/* Priority and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-white font-medium text-sm mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-white font-medium text-sm mb-2">
                  Initial Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            {/* Due Date and Budget Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dueDate" className="block text-white font-medium text-sm mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-white font-medium text-sm mb-2">
                  Budget (Optional)
                </label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50"
                  placeholder="e.g., $10,000"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <Link
                to="/projects"
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-3 hover:bg-white/15 transition-all duration-300 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-white/90 shadow-lg'
                }`}
              >
                {isSubmitting ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreatePage;