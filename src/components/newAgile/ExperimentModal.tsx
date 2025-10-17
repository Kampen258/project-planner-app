import React, { useState } from 'react';
import type { ExperimentCreateRequest } from '../../types/newAgile';

interface ExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experiment: ExperimentCreateRequest) => Promise<void>;
  projectId: string;
}

const ExperimentModal: React.FC<ExperimentModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Define the experiment' },
    { id: 2, title: 'Test Setup', description: 'Configure the test parameters' },
    { id: 3, title: 'Success Metrics', description: 'Define measurable outcomes' },
    { id: 4, title: 'Timeline', description: 'Set dates and participants' }
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

  const [formData, setFormData] = useState<ExperimentCreateRequest>({
    hypothesis_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    participants: 0,
    method: 'ab_test',
    success_metrics: [{ metric: '', baseline: 0, target: 0 }]
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'participants' ? parseInt(value) || 0 : value
    }));
  };

  const handleMetricChange = (index: number, field: 'metric' | 'baseline' | 'target', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      success_metrics: prev.success_metrics.map((metric, i) =>
        i === index
          ? { ...metric, [field]: field === 'metric' ? value : Number(value) || 0 }
          : metric
      )
    }));
  };

  const addMetric = () => {
    setFormData(prev => ({
      ...prev,
      success_metrics: [...prev.success_metrics, { metric: '', baseline: 0, target: 0 }]
    }));
  };

  const removeMetric = (index: number) => {
    setFormData(prev => ({
      ...prev,
      success_metrics: prev.success_metrics.filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Brief, descriptive title for this experiment"
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
                placeholder="What exactly will you test? How will the experiment work?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Hypothesis ID
              </label>
              <input
                type="text"
                name="hypothesis_id"
                value={formData.hypothesis_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Link to the hypothesis this experiment will test"
              />
              <p className="text-white/50 text-xs mt-2">
                Optional: Connect this experiment to a specific hypothesis
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Test Setup</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Test Method *
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                required
              >
                <option value="ab_test" className="bg-gray-800">A/B Test - Compare two versions</option>
                <option value="prototype" className="bg-gray-800">Prototype - Test with working prototype</option>
                <option value="concierge" className="bg-gray-800">Concierge - Manual service first</option>
                <option value="interview" className="bg-gray-800">Interview - User conversations</option>
                <option value="analytics" className="bg-gray-800">Analytics - Data analysis</option>
                <option value="survey" className="bg-gray-800">Survey - User feedback collection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Expected Participants *
              </label>
              <input
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Number of users/participants in the experiment"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Success Metrics</h4>
            <p className="text-white/70 text-sm mb-4">
              Define the metrics you'll track to measure experiment success
            </p>

            {formData.success_metrics.map((metric, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-white font-medium">Metric {index + 1}</h5>
                  {formData.success_metrics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMetric(index)}
                      className="p-1 text-white/50 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Metric Name *
                    </label>
                    <input
                      type="text"
                      value={metric.metric}
                      onChange={(e) => handleMetricChange(index, 'metric', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="e.g., 'Conversion Rate', 'Task Completion Time'"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Baseline Value *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={metric.baseline}
                        onChange={(e) => handleMetricChange(index, 'baseline', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Current value"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Target Value *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={metric.target}
                        onChange={(e) => handleMetricChange(index, 'target', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Goal value"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addMetric}
              className="text-blue-300 hover:text-blue-200 text-sm transition-colors inline-flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Another Metric</span>
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
              <h5 className="text-blue-200 font-medium mb-2">Experiment Duration</h5>
              <p className="text-blue-200/80 text-sm">
                {formData.start_date && formData.end_date ? (
                  `${Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                ) : (
                  'Select start and end dates to see duration'
                )}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h5 className="text-white/90 font-medium mb-2">Pre-launch Checklist</h5>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Hypothesis clearly defined and linked</li>
                <li>• Success metrics baseline values confirmed</li>
                <li>• Test method and setup validated</li>
                <li>• Participant recruitment plan ready</li>
                <li>• Data collection tools configured</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.start_date) errors.push('Start date is required');
    if (!formData.end_date) errors.push('End date is required');
    if (formData.participants <= 0) errors.push('Number of participants must be greater than 0');

    // Validate dates
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        errors.push('End date must be after start date');
      }
    }

    // Validate metrics
    const validMetrics = formData.success_metrics.filter(m => m.metric.trim());
    if (validMetrics.length === 0) {
      errors.push('At least one success metric is required');
    }

    return errors;
  };

  const resetModal = () => {
    setCurrentStep(1);
    setError(null);
    setFormData({
      hypothesis_id: '',
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      participants: 0,
      method: 'ab_test',
      success_metrics: [{ metric: '', baseline: 0, target: 0 }]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    try {
      // Clean up empty metrics before saving
      const cleanedData = {
        ...formData,
        success_metrics: formData.success_metrics.filter(m => m.metric.trim())
      };

      await onSave(cleanedData);
      onClose();
      resetModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save experiment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;


  const InfoModal = () => (
    <>
      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Modal */}
          <div className="relative w-full max-w-2xl glass-card animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">What is an Experiment?</h3>
                <p className="text-white/70">Understanding validation testing in New Agile</p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-white/90">
                An <strong>Experiment</strong> is a structured test designed to validate or invalidate a hypothesis with real users and measurable outcomes.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium mb-1">Key Characteristics:</h4>
                  <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                    <li>Time-boxed with clear start and end dates</li>
                    <li>Measurable success criteria and metrics</li>
                    <li>Specific number of participants or sample size</li>
                    <li>Clear methodology for data collection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Discovery to Delivery:</h4>
                  <p className="text-white/80 text-sm">
                    Successful experiments provide evidence to scale solutions into delivery tasks. Failed experiments help us learn quickly and cheaply what doesn't work, saving time and resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Modal */}
          <div className="relative w-full max-w-4xl bg-gray-800/70 backdrop-blur-md border border-gray-600/20 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Create New Experiment</h3>
                    <p className="text-white/70">{steps[currentStep - 1].description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowInfo(true)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      title="What is an Experiment?"
                    >
                      <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center space-x-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep >= step.id
                          ? 'bg-white/20 text-white border-2 border-white/30'
                          : 'bg-white/5 text-white/50 border-2 border-white/10'
                      }`}>
                        {step.id}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <p className={`text-sm font-medium ${
                          currentStep >= step.id ? 'text-white' : 'text-white/50'
                        }`}>
                          {step.title}
                        </p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mx-4 ${
                          currentStep > step.id ? 'bg-white/30' : 'bg-white/10'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg m-6 mb-0">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* Form Content */}
              <div className="p-6">
                {renderStepContent()}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 text-white/80 hover:text-white transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || loading}
                    className="px-6 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loading}
                      className="px-8 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Create Experiment</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && <InfoModal />}
    </>
  );
};

export default ExperimentModal;