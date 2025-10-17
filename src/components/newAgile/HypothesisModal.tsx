import React, { useState } from 'react';
import type { HypothesisCreateRequest } from '../../types/newAgile';

interface HypothesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hypothesis: HypothesisCreateRequest) => Promise<void>;
  projectId: string;
}

const HypothesisModal: React.FC<HypothesisModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Define the hypothesis' },
    { id: 2, title: 'Test Strategy', description: 'How will you validate this?' },
    { id: 3, title: 'Success Criteria', description: 'Define thresholds for decisions' },
    { id: 4, title: 'Resources', description: 'What do you need to test this?' }
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

  const [formData, setFormData] = useState<HypothesisCreateRequest>({
    opportunity_id: '',
    title: '',
    hypothesis_statement: '',
    assumptions: [''],
    test_method: '',
    success_criteria: '',
    scale_threshold: '',
    iterate_threshold: '',
    kill_threshold: '',
    resources_needed: {
      time: '',
      people: [''],
      tools: ['']
    }
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

  const handleResourceChange = (
    field: 'time' | 'people' | 'tools',
    value: string,
    index?: number
  ) => {
    setFormData(prev => ({
      ...prev,
      resources_needed: {
        ...prev.resources_needed,
        [field]: field === 'time'
          ? value
          : field === 'people' || field === 'tools'
          ? prev.resources_needed[field].map((item, i) => i === index ? value : item)
          : prev.resources_needed[field]
      }
    }));
  };

  const addResourceItem = (field: 'people' | 'tools') => {
    setFormData(prev => ({
      ...prev,
      resources_needed: {
        ...prev.resources_needed,
        [field]: [...prev.resources_needed[field], '']
      }
    }));
  };

  const removeResourceItem = (field: 'people' | 'tools', index: number) => {
    setFormData(prev => ({
      ...prev,
      resources_needed: {
        ...prev.resources_needed,
        [field]: prev.resources_needed[field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleAssumptionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      assumptions: prev.assumptions.map((item, i) => i === index ? value : item)
    }));
  };

  const addAssumption = () => {
    setFormData(prev => ({
      ...prev,
      assumptions: [...prev.assumptions, '']
    }));
  };

  const removeAssumption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assumptions: prev.assumptions.filter((_, i) => i !== index)
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
                placeholder="Brief, descriptive title for this hypothesis"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Hypothesis Statement *
              </label>
              <textarea
                name="hypothesis_statement"
                value={formData.hypothesis_statement}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="If we [change/build], then [users] will [behavior], measured by [metric]"
                required
              />
              <p className="text-white/50 text-xs mt-2">
                Example: "If we add a quick-action toolbar, then power users will complete tasks 20% faster, measured by average task completion time"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Key Assumptions
              </label>
              {formData.assumptions.map((assumption, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={assumption}
                    onChange={(e) => handleAssumptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="What assumption needs to be validated?"
                  />
                  {formData.assumptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAssumption(index)}
                      className="p-2 text-white/50 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAssumption}
                className="text-blue-300 hover:text-blue-200 text-sm transition-colors inline-flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Assumption</span>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Test Strategy</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Test Method *
              </label>
              <select
                name="test_method"
                value={formData.test_method}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                required
              >
                <option value="" className="bg-gray-800">Select test method...</option>
                <option value="a_b_test" className="bg-gray-800">A/B Test - Compare two versions</option>
                <option value="prototype" className="bg-gray-800">Prototype - Build and test with users</option>
                <option value="user_interviews" className="bg-gray-800">User Interviews - Qualitative feedback</option>
                <option value="analytics" className="bg-gray-800">Analytics - Measure existing behavior</option>
                <option value="survey" className="bg-gray-800">Survey - Gather user opinions</option>
                <option value="concierge" className="bg-gray-800">Concierge - Manual process first</option>
                <option value="wizard_of_oz" className="bg-gray-800">Wizard of Oz - Simulate functionality</option>
                <option value="dogfooding" className="bg-gray-800">Dogfooding - Internal testing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Opportunity ID
              </label>
              <input
                type="text"
                name="opportunity_id"
                value={formData.opportunity_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Link to the opportunity this hypothesis addresses"
              />
              <p className="text-white/50 text-xs mt-2">
                Optional: Connect this hypothesis to a specific opportunity
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Success Criteria</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Success Criteria *
              </label>
              <textarea
                name="success_criteria"
                value={formData.success_criteria}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="How will we measure success? What metrics and targets?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Scale Threshold
              </label>
              <input
                type="text"
                name="scale_threshold"
                value={formData.scale_threshold}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="What results would make us scale this solution?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Iterate Threshold
              </label>
              <input
                type="text"
                name="iterate_threshold"
                value={formData.iterate_threshold}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="What results would make us iterate and try again?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Kill Threshold
              </label>
              <input
                type="text"
                name="kill_threshold"
                value={formData.kill_threshold}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="What results would make us abandon this hypothesis?"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-white mb-4">Resources Needed</h4>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Time Estimate
              </label>
              <input
                type="text"
                value={formData.resources_needed.time}
                onChange={(e) => handleResourceChange('time', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="How long will this test take? (e.g., '2 weeks', '1 month')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                People Needed
              </label>
              {formData.resources_needed.people.map((person, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={person}
                    onChange={(e) => handleResourceChange('people', e.target.value, index)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Role or person needed (e.g., 'Designer', 'Data Analyst')"
                  />
                  {formData.resources_needed.people.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResourceItem('people', index)}
                      className="p-2 text-white/50 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addResourceItem('people')}
                className="text-blue-300 hover:text-blue-200 text-sm transition-colors inline-flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Person</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tools/Resources
              </label>
              {formData.resources_needed.tools.map((tool, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={tool}
                    onChange={(e) => handleResourceChange('tools', e.target.value, index)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Tool or resource needed (e.g., 'Figma', 'Analytics platform')"
                  />
                  {formData.resources_needed.tools.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResourceItem('tools', index)}
                      className="p-2 text-white/50 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addResourceItem('tools')}
                className="text-blue-300 hover:text-blue-200 text-sm transition-colors inline-flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Tool</span>
              </button>
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
    if (!formData.hypothesis_statement.trim()) errors.push('Hypothesis statement is required');
    if (!formData.test_method.trim()) errors.push('Test method is required');
    if (!formData.success_criteria.trim()) errors.push('Success criteria is required');

    return errors;
  };

  const resetModal = () => {
    setCurrentStep(1);
    setError(null);
    setFormData({
      opportunity_id: '',
      title: '',
      hypothesis_statement: '',
      assumptions: [''],
      test_method: '',
      success_criteria: '',
      scale_threshold: '',
      iterate_threshold: '',
      kill_threshold: '',
      resources_needed: {
        time: '',
        people: [''],
        tools: ['']
      }
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
      // Clean up empty arrays before saving
      const cleanedData = {
        ...formData,
        assumptions: formData.assumptions.filter(a => a.trim()),
        resources_needed: {
          ...formData.resources_needed,
          people: formData.resources_needed.people.filter(p => p.trim()),
          tools: formData.resources_needed.tools.filter(t => t.trim())
        }
      };

      await onSave(cleanedData);
      onClose();
      resetModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hypothesis');
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
                <h3 className="text-xl font-bold text-white mb-2">What is a Hypothesis?</h3>
                <p className="text-white/70">Understanding solution validation in New Agile</p>
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
                A <strong>Hypothesis</strong> represents a potential solution to an opportunity - a testable assumption about what might solve the problem.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium mb-1">Key Characteristics:</h4>
                  <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                    <li>Testable and measurable prediction</li>
                    <li>Clearly defined success criteria</li>
                    <li>Includes scale/iterate/kill thresholds</li>
                    <li>Backed by a clear test methodology</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Discovery Flow:</h4>
                  <p className="text-white/80 text-sm">
                    Opportunities generate Hypotheses → Hypotheses are tested through Experiments → Successful experiments become Delivery Tasks.
                    This approach ensures we validate solutions before building them.
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
                    <h3 className="text-2xl font-bold text-white mb-2">Create New Hypothesis</h3>
                    <p className="text-white/70">{steps[currentStep - 1].description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowInfo(true)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      title="What is a Hypothesis?"
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
                          <span>Create Hypothesis</span>
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

export default HypothesisModal;