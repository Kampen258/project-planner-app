import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../layout/Navigation-enhanced';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { ProjectService } from '../../services/projectService';
import { debugLogger } from '../../utils/debug-logger';
import type { Project } from '../../types';

const COMPONENT_NAME = 'EnhancedProjectCreation';

interface ProjectFormData {
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  tags: string[];
  start_date: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  template: string;
}

const PROJECT_TEMPLATES = [
  { id: 'blank', name: 'Blank Project', description: 'Start from scratch' },
  { id: 'web-app', name: 'Web Application', description: 'Frontend and backend development' },
  { id: 'mobile-app', name: 'Mobile App', description: 'iOS and Android development' },
  { id: 'marketing', name: 'Marketing Campaign', description: 'Marketing and advertising project' },
  { id: 'research', name: 'Research Project', description: 'Research and analysis project' },
  { id: 'event', name: 'Event Planning', description: 'Event organization and management' },
];

export function EnhancedProjectCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    status: 'planning',
    tags: [],
    start_date: '',
    due_date: '',
    priority: 'medium',
    template: 'blank',
  });

  const startTime = performance.now();
  const totalSteps = 3;

  // Component lifecycle logging
  useEffect(() => {
    const endTime = performance.now();
    debugLogger.componentMount(COMPONENT_NAME, { user: user?.id });
    debugLogger.pageLoad('/projects/new', COMPONENT_NAME, { start: startTime, end: endTime });

    return () => {
      debugLogger.componentUnmount(COMPONENT_NAME);
    };
  }, []);

  // Form validation
  const validateCurrentStep = useCallback(() => {
    debugLogger.debug('Form Validation', `Validating step ${currentStep}`, { currentStep, formData }, COMPONENT_NAME);

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          setError('Project title is required');
          return false;
        }
        if (formData.title.length < 3) {
          setError('Project title must be at least 3 characters');
          return false;
        }
        break;

      case 2:
        if (!formData.description.trim()) {
          setError('Project description is required');
          return false;
        }
        if (formData.description.length < 10) {
          setError('Project description must be at least 10 characters');
          return false;
        }
        break;

      case 3:
        if (formData.start_date && formData.due_date) {
          if (new Date(formData.start_date) > new Date(formData.due_date)) {
            setError('Start date cannot be after due date');
            return false;
          }
        }
        break;
    }

    setError(null);
    return true;
  }, [currentStep, formData]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      debugLogger.userAction('Step Navigation', COMPONENT_NAME, { from: currentStep, to: currentStep + 1 });
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    debugLogger.userAction('Step Navigation', COMPONENT_NAME, { from: currentStep, to: currentStep - 1 });
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string | string[]) => {
    debugLogger.verbose('Form Input', `Field ${field} changed`, {
      field,
      valueType: typeof value,
      valueLength: Array.isArray(value) ? value.length : (value as string).length
    }, COMPONENT_NAME);

    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      debugLogger.userAction('Tag Added', COMPONENT_NAME, { tag, totalTags: formData.tags.length + 1 });
      handleInputChange('tags', [...formData.tags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    debugLogger.userAction('Tag Removed', COMPONENT_NAME, { tag: tagToRemove, totalTags: formData.tags.length - 1 });
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!user) {
      debugLogger.warn('Project Creation', 'No user found for project creation', {}, COMPONENT_NAME);
      setError('You must be logged in to create a project');
      return;
    }

    try {
      debugLogger.userAction('Project Creation Started', COMPONENT_NAME, {
        template: formData.template,
        priority: formData.priority,
        hasTags: formData.tags.length > 0,
        hasDateRange: !!(formData.start_date && formData.due_date)
      });

      setIsLoading(true);
      setError(null);

      const projectData: Partial<Project> = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        progress: 0,
        tags: formData.tags,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        user_id: user.id,
        ai_generated: false,
        metadata: {
          template: formData.template,
          priority: formData.priority,
          created_via: 'enhanced_form',
        },
      };

      debugLogger.info('Project Creation', 'Creating project', projectData, COMPONENT_NAME);

      const createdProject = await ProjectService.createProject(projectData);

      debugLogger.info('Project Creation', 'Project created successfully', {
        projectId: createdProject.id,
        title: createdProject.title,
      }, COMPONENT_NAME);

      setSuccess(`Project "${createdProject.title}" created successfully!`);

      // Redirect after short delay
      setTimeout(() => {
        navigate(`/projects`);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      debugLogger.error('Project Creation', 'Project creation failed', { error: err }, COMPONENT_NAME);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <React.Fragment key={stepNumber}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500/20 border-green-400 text-green-300'
                    : isActive
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                    : 'bg-white/10 border-white/30 text-white/50'
                }`}>
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    stepNumber < currentStep ? 'bg-green-400' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="text-center mt-4">
          <p className="text-white/70">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    debugLogger.debug('Render', 'Rendering step 1: Basic Information', {}, COMPONENT_NAME);

    return (
      <ErrorBoundary fallback={<div className="text-red-300">Error loading step 1</div>}>
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Project Basics</h2>
            <p className="text-white/70">Let's start with the fundamentals of your project</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                         focus:border-transparent"
              placeholder="Enter your project title"
              maxLength={100}
              disabled={isLoading}
            />
            <p className="text-white/50 text-xs mt-1">{formData.title.length}/100 characters</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleInputChange('template', template.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    formData.template === template.id
                      ? 'bg-blue-500/20 border-blue-400 text-white'
                      : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                  }`}
                  disabled={isLoading}
                >
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm opacity-80">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  };

  const renderStep2 = () => {
    debugLogger.debug('Render', 'Rendering step 2: Details', {}, COMPONENT_NAME);

    return (
      <ErrorBoundary fallback={<div className="text-red-300">Error loading step 2</div>}>
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Project Details</h2>
            <p className="text-white/70">Tell us more about your project</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                         focus:border-transparent resize-none"
              placeholder="Describe your project goals, requirements, and expectations..."
              maxLength={1000}
              disabled={isLoading}
            />
            <p className="text-white/50 text-xs mt-1">{formData.description.length}/1000 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as any)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                disabled={isLoading}
              >
                <option value="low" className="bg-gray-800 text-white">Low Priority</option>
                <option value="medium" className="bg-gray-800 text-white">Medium Priority</option>
                <option value="high" className="bg-gray-800 text-white">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                disabled={isLoading}
              >
                <option value="planning" className="bg-gray-800 text-white">Planning</option>
                <option value="in_progress" className="bg-gray-800 text-white">In Progress</option>
                <option value="on_hold" className="bg-gray-800 text-white">On Hold</option>
                <option value="completed" className="bg-gray-800 text-white">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2
                           text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                placeholder="Add a tag and press Enter"
                disabled={isLoading}
              />
              <button
                onClick={handleAddTag}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg
                           border border-blue-400/30 transition-all duration-200"
                disabled={isLoading || !tagInput.trim()}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm
                             border border-purple-400/30 flex items-center space-x-2"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-purple-300 hover:text-red-300 transition-colors"
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  };

  const renderStep3 = () => {
    debugLogger.debug('Render', 'Rendering step 3: Timeline', {}, COMPONENT_NAME);

    return (
      <ErrorBoundary fallback={<div className="text-red-300">Error loading step 3</div>}>
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Project Timeline</h2>
            <p className="text-white/70">Set your project dates and finalize creation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-black/20 rounded-lg p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-4">Project Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Title:</span>
                <span className="text-white">{formData.title || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Template:</span>
                <span className="text-white">
                  {PROJECT_TEMPLATES.find(t => t.id === formData.template)?.name || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Priority:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  formData.priority === 'high'
                    ? 'bg-red-500/20 text-red-300'
                    : formData.priority === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Tags:</span>
                <span className="text-white">{formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}</span>
              </div>
              {(formData.start_date || formData.due_date) && (
                <div className="flex justify-between">
                  <span className="text-white/70">Timeline:</span>
                  <span className="text-white">
                    {formData.start_date && formData.due_date
                      ? `${formData.start_date} to ${formData.due_date}`
                      : formData.start_date
                      ? `Starting ${formData.start_date}`
                      : `Due ${formData.due_date}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Project Created!</h1>
            <p className="text-white/80 text-lg mb-8">{success}</p>
            <div className="animate-pulse text-white/60">
              Redirecting to your projects...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create New Project</h1>
            <p className="text-white/80 text-lg">Let's bring your ideas to life</p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1 || isLoading}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg
                           transition-all duration-300 border border-white/20
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30
                             text-white px-6 py-3 rounded-lg transition-all duration-300 border border-blue-400/30
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30
                             text-white px-8 py-3 rounded-lg transition-all duration-300 border border-green-400/30
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default EnhancedProjectCreation;