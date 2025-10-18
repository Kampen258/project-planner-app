import React, { useState } from 'react';
import type { DeliveryTaskCreateRequest, EffortEstimate } from '../../types/newAgile';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: DeliveryTaskCreateRequest) => Promise<void>;
  projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Task details and description' },
    { id: 2, title: 'Requirements', description: 'Acceptance criteria and references' },
    { id: 3, title: 'Assignment', description: 'Priority, effort, and assignee' },
    { id: 4, title: 'Categories', description: 'Tags and organization' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [formData, setFormData] = useState<DeliveryTaskCreateRequest>({
    title: '',
    description: '',
    priority: 'medium',
    effort: 'M',
    assignee: '',
    experiment_reference: '',
    hypothesis_reference: '',
    acceptance_criteria: [''],
    tags: ['']
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: 'acceptance_criteria' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'acceptance_criteria' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'acceptance_criteria' | 'tags', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.acceptance_criteria.some(criteria => criteria.trim() !== '');
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      const cleanedData = {
        ...formData,
        acceptance_criteria: formData.acceptance_criteria.filter(criteria => criteria.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        assignee: formData.assignee || undefined,
        experiment_reference: formData.experiment_reference || undefined,
        hypothesis_reference: formData.hypothesis_reference || undefined
      };

      await onSave(cleanedData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        effort: 'M',
        assignee: '',
        experiment_reference: '',
        hypothesis_reference: '',
        acceptance_criteria: [''],
        tags: ['']
      });
      setCurrentStep(1);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Brief, descriptive title for this task"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Detailed description of what needs to be done"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Requirements</h4>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Acceptance Criteria *
              </label>
              <div className="space-y-3">
                {formData.acceptance_criteria.map((criteria, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={criteria}
                      onChange={(e) => handleArrayChange('acceptance_criteria', index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder={`Acceptance criterion ${index + 1}`}
                    />
                    {formData.acceptance_criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('acceptance_criteria', index)}
                        className="px-3 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('acceptance_criteria')}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white/70 transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span> Add Acceptance Criterion
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Experiment Reference
              </label>
              <input
                type="text"
                name="experiment_reference"
                value={formData.experiment_reference}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Link to supporting experiment (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Hypothesis Reference
              </label>
              <input
                type="text"
                name="hypothesis_reference"
                value={formData.hypothesis_reference}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Link to supporting hypothesis (optional)"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Assignment</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="low" className="bg-gray-800 text-white">Low</option>
                  <option value="medium" className="bg-gray-800 text-white">Medium</option>
                  <option value="high" className="bg-gray-800 text-white">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Effort Estimate *
                </label>
                <select
                  name="effort"
                  value={formData.effort}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="S" className="bg-gray-800 text-white">Small (S)</option>
                  <option value="M" className="bg-gray-800 text-white">Medium (M)</option>
                  <option value="L" className="bg-gray-800 text-white">Large (L)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Assignee
              </label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Who will work on this task? (optional)"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Categories</h4>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tags
              </label>
              <div className="space-y-3">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder={`Tag ${index + 1} (e.g., backend, frontend, ui)`}
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="px-3 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white/70 transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span> Add Tag
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h5 className="text-white/90 font-medium mb-2">Task Summary</h5>
              <div className="space-y-1 text-sm text-white/70">
                <div><strong>Title:</strong> {formData.title || 'Untitled Task'}</div>
                <div><strong>Priority:</strong> {formData.priority}</div>
                <div><strong>Effort:</strong> {formData.effort}</div>
                {formData.assignee && <div><strong>Assignee:</strong> {formData.assignee}</div>}
                <div><strong>Acceptance Criteria:</strong> {formData.acceptance_criteria.filter(c => c.trim()).length} items</div>
                <div><strong>Tags:</strong> {formData.tags.filter(t => t.trim()).length} tags</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative bg-gray-800/70 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h3 className="text-xl font-bold text-white">Create New Task</h3>
            <p className="text-white/70 text-sm">Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center ${step.id < steps.length ? 'flex-1' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 ${
                    step.id === currentStep
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : step.id < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-white/30 text-white/50'
                  }`}
                >
                  {step.id < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                {step.id < steps.length && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-2">
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/20">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!validateStep()}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !validateStep()}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;