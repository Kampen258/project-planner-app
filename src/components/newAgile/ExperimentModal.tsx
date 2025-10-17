import React, { useState } from 'react';
import StepWizardModal, { Step } from '../common/StepWizardModal';
import { FormField, TextInput, TextArea, Select, StepContent } from '../common/FormFields';

interface ExperimentCreateRequest {
  title: string;
  hypothesis_id: string;
  experiment_type: 'a_b_test' | 'prototype' | 'survey' | 'user_interview' | 'analytics' | 'other';
  description: string;
  success_criteria: string;
  target_audience: string;
  methodology: string;
  duration: string;
  resources_needed: string;
  risk_mitigation: string;
  expected_outcome: string;
  confidence_level: 'low' | 'medium' | 'high';
}

interface ExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experiment: ExperimentCreateRequest) => Promise<void>;
  projectId: string;
  availableHypotheses?: { id: string; title: string }[];
}

const ExperimentModal: React.FC<ExperimentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  availableHypotheses = []
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const steps: Step[] = [
    { id: 1, title: 'Basic Setup', description: 'Define the experiment' },
    { id: 2, title: 'Methodology', description: 'How will we run this?' },
    { id: 3, title: 'Planning', description: 'Resources and timeline' },
    { id: 4, title: 'Risk & Success', description: 'Define success and mitigate risks' }
  ];

  const [formData, setFormData] = useState<ExperimentCreateRequest>({
    title: '',
    hypothesis_id: '',
    experiment_type: 'prototype',
    description: '',
    success_criteria: '',
    target_audience: '',
    methodology: '',
    duration: '',
    resources_needed: '',
    risk_mitigation: '',
    expected_outcome: '',
    confidence_level: 'medium'
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

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.success_criteria.trim()) errors.push('Success criteria is required');
    if (!formData.methodology.trim()) errors.push('Methodology is required');
    return errors;
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
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save experiment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      hypothesis_id: '',
      experiment_type: 'prototype',
      description: '',
      success_criteria: '',
      target_audience: '',
      methodology: '',
      duration: '',
      resources_needed: '',
      risk_mitigation: '',
      expected_outcome: '',
      confidence_level: 'medium'
    });
    setError(null);
  };

  const experimentTypes = [
    { value: 'a_b_test', label: 'A/B Test - Compare two versions' },
    { value: 'prototype', label: 'Prototype - Build and test a concept' },
    { value: 'survey', label: 'Survey - Gather user feedback' },
    { value: 'user_interview', label: 'User Interview - Direct user research' },
    { value: 'analytics', label: 'Analytics - Data analysis experiment' },
    { value: 'other', label: 'Other - Custom experiment type' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContent title="Basic Setup">
            <FormField label="Title" required>
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief, descriptive title for this experiment"
                required
              />
            </FormField>

            {availableHypotheses.length > 0 && (
              <FormField label="Related Hypothesis">
                <Select
                  name="hypothesis_id"
                  value={formData.hypothesis_id}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select a hypothesis (optional)' },
                    ...availableHypotheses.map(h => ({ value: h.id, label: h.title }))
                  ]}
                />
              </FormField>
            )}

            <FormField label="Experiment Type">
              <Select
                name="experiment_type"
                value={formData.experiment_type}
                onChange={handleChange}
                options={experimentTypes}
              />
            </FormField>

            <FormField label="Description" required>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What are we testing and why? What do we hope to learn?"
                rows={4}
                required
              />
            </FormField>
          </StepContent>
        );

      case 2:
        return (
          <StepContent title="Methodology">
            <FormField label="Target Audience">
              <TextInput
                name="target_audience"
                value={formData.target_audience}
                onChange={handleChange}
                placeholder="Who will participate in this experiment?"
              />
            </FormField>

            <FormField label="Methodology" required>
              <TextArea
                name="methodology"
                value={formData.methodology}
                onChange={handleChange}
                placeholder="Detailed steps of how we will conduct this experiment"
                rows={5}
                required
              />
            </FormField>

            <FormField label="Success Criteria" required>
              <TextArea
                name="success_criteria"
                value={formData.success_criteria}
                onChange={handleChange}
                placeholder="What metrics will determine if this experiment succeeds or fails?"
                rows={3}
                required
              />
            </FormField>
          </StepContent>
        );

      case 3:
        return (
          <StepContent title="Planning">
            <FormField label="Duration">
              <TextInput
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="How long will this experiment run? (e.g., 2 weeks)"
              />
            </FormField>

            <FormField label="Resources Needed">
              <TextArea
                name="resources_needed"
                value={formData.resources_needed}
                onChange={handleChange}
                placeholder="What tools, people, budget, or other resources are needed?"
                rows={3}
              />
            </FormField>

            <FormField label="Expected Outcome">
              <TextArea
                name="expected_outcome"
                value={formData.expected_outcome}
                onChange={handleChange}
                placeholder="What do we expect to happen? What would validate or invalidate our hypothesis?"
                rows={3}
              />
            </FormField>
          </StepContent>
        );

      case 4:
        return (
          <StepContent title="Risk & Success">
            <FormField label="Risk Mitigation">
              <TextArea
                name="risk_mitigation"
                value={formData.risk_mitigation}
                onChange={handleChange}
                placeholder="What could go wrong and how will we handle it?"
                rows={3}
              />
            </FormField>

            <FormField label="Confidence Level">
              <Select
                name="confidence_level"
                value={formData.confidence_level}
                onChange={handleChange}
                options={[
                  { value: 'low', label: 'Low - High uncertainty in outcome' },
                  { value: 'medium', label: 'Medium - Some confidence in approach' },
                  { value: 'high', label: 'High - Strong confidence in methodology' }
                ]}
              />
            </FormField>
          </StepContent>
        );

      default:
        return null;
    }
  };

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
                <h3 className="text-xl font-bold text-white mb-2">What is an Experiment?</h3>
                <p className="text-white/70">Testing hypotheses in New Agile methodology</p>
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
                An <strong>Experiment</strong> is a controlled test designed to validate or invalidate a hypothesis.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium mb-1">Key Principles:</h4>
                  <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                    <li>Test one variable at a time when possible</li>
                    <li>Define clear success criteria before starting</li>
                    <li>Use the minimum viable test to get valid results</li>
                    <li>Plan for both success and failure scenarios</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Discovery Flow:</h4>
                  <p className="text-white/80 text-sm">
                    Opportunities → Hypotheses → <strong>Experiments</strong> → Delivery Tasks.
                    Experiments provide evidence to support or reject hypotheses, leading to informed delivery decisions.
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
      <StepWizardModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title="Create New Experiment"
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        error={error}
        loading={loading}
        submitButtonText="Create Experiment"
        showInfoButton={true}
        onInfoClick={() => setShowInfo(true)}
        infoTooltip="What is an Experiment?"
      >
        {renderStepContent()}
      </StepWizardModal>

      {/* Info Modal */}
      {showInfo && <InfoModal />}
    </>
  );
};

export default ExperimentModal;