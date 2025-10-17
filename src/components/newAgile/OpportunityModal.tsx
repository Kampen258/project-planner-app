import React, { useState } from 'react';
import type { OpportunityCreateRequest, OpportunityStatus, ConfidenceLevel, EffortEstimate, RiskLevel, CostOfDelay } from '../../types/newAgile';

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: OpportunityCreateRequest) => Promise<void>;
  projectId: string;
}

const OpportunityModal: React.FC<OpportunityModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Define the opportunity' },
    { id: 2, title: 'Context', description: 'Current and desired state' },
    { id: 3, title: 'Evidence & Metrics', description: 'Supporting data' },
    { id: 4, title: 'Assessment', description: 'Risk and effort evaluation' }
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

  const [formData, setFormData] = useState<OpportunityCreateRequest>({
    title: '',
    problem_statement: '',
    affected_users: '',
    current_state: '',
    desired_outcome: '',
    success_metrics: '',
    evidence: '',
    assumptions: '',
    confidence_level: 'medium' as ConfidenceLevel,
    effort_estimate: 'medium' as EffortEstimate,
    risk_level: 'medium' as RiskLevel,
    cost_of_delay: 'medium' as CostOfDelay,
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
                placeholder="Brief, descriptive title for this opportunity"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Problem Statement *
              </label>
              <textarea
                name="problem_statement"
                value={formData.problem_statement}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="What specific problem are users facing? Be clear and specific."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Affected Users *
              </label>
              <input
                type="text"
                name="affected_users"
                value={formData.affected_users}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Who is experiencing this problem? (e.g., 'Power users managing large datasets')"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Context</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Current State
              </label>
              <textarea
                name="current_state"
                value={formData.current_state}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="How do users currently handle this situation?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Desired Outcome
              </label>
              <textarea
                name="desired_outcome"
                value={formData.desired_outcome}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="What would success look like for users and the business?"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Evidence & Metrics</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Success Metrics
              </label>
              <textarea
                name="success_metrics"
                value={formData.success_metrics}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="How will we measure success? What metrics will improve?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Supporting Evidence
              </label>
              <textarea
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="What evidence supports this opportunity? User feedback, analytics, research findings..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Key Assumptions
              </label>
              <textarea
                name="assumptions"
                value={formData.assumptions}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="What assumptions are we making that need to be validated?"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Initial Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Confidence Level
                </label>
                <select
                  name="confidence_level"
                  value={formData.confidence_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="low" className="bg-gray-800">Low - High uncertainty</option>
                  <option value="medium" className="bg-gray-800">Medium - Some validation needed</option>
                  <option value="high" className="bg-gray-800">High - Strong evidence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Effort Estimate
                </label>
                <select
                  name="effort_estimate"
                  value={formData.effort_estimate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="small" className="bg-gray-800">Small - Days to weeks</option>
                  <option value="medium" className="bg-gray-800">Medium - Weeks to months</option>
                  <option value="large" className="bg-gray-800">Large - Months+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Risk Level
                </label>
                <select
                  name="risk_level"
                  value={formData.risk_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="low" className="bg-gray-800">Low - Safe bet</option>
                  <option value="medium" className="bg-gray-800">Medium - Some unknowns</option>
                  <option value="high" className="bg-gray-800">High - Significant uncertainty</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Cost of Delay
                </label>
                <select
                  name="cost_of_delay"
                  value={formData.cost_of_delay}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="low" className="bg-gray-800">Low - Can wait</option>
                  <option value="medium" className="bg-gray-800">Medium - Moderate urgency</option>
                  <option value="high" className="bg-gray-800">High - Time sensitive</option>
                </select>
              </div>
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
    if (!formData.problem_statement.trim()) errors.push('Problem statement is required');
    if (!formData.affected_users.trim()) errors.push('Affected users is required');

    return errors;
  };

  const resetModal = () => {
    setCurrentStep(1);
    setError(null);
    setFormData({
      title: '',
      problem_statement: '',
      affected_users: '',
      current_state: '',
      desired_outcome: '',
      success_metrics: '',
      evidence: '',
      assumptions: '',
      confidence_level: 'medium' as ConfidenceLevel,
      effort_estimate: 'medium' as EffortEstimate,
      risk_level: 'medium' as RiskLevel,
      cost_of_delay: 'medium' as CostOfDelay,
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
      await onSave(formData);
      onClose();
      resetModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save opportunity');
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={() => setShowInfo(false)}
      />
      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Modal */}
          <div className="relative w-full max-w-2xl glass-card animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">What is an Opportunity?</h3>
                <p className="text-white/70">Understanding the New Agile approach to problem identification</p>
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
                An <strong>Opportunity</strong> represents a problem worth solving - a potential area where we can create value for users and the business.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium mb-1">Key Characteristics:</h4>
                  <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                    <li>Outcome-focused rather than solution-focused</li>
                    <li>Backed by evidence and user research</li>
                    <li>Clearly identifies affected user groups</li>
                    <li>Quantifies potential impact and effort required</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Discovery Process:</h4>
                  <p className="text-white/80 text-sm">
                    Opportunities flow into Hypotheses (potential solutions) → Experiments (validation tests) → Delivery Tasks (implementation work).
                    This ensures we build the right thing, not just build the thing right.
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
                    <h3 className="text-2xl font-bold text-white mb-2">Create New Opportunity</h3>
                    <p className="text-white/70">{steps[currentStep - 1].description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowInfo(true)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      title="What is an Opportunity?"
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
                          <span>Create Opportunity</span>
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

export default OpportunityModal;