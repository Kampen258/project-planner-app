import React, { useState, useEffect } from 'react';

export interface Step {
  id: number;
  title: string;
  description: string;
}

export interface StepWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  children: React.ReactNode;
  error?: string | null;
  loading?: boolean;
  submitButtonText?: string;
  showInfoButton?: boolean;
  onInfoClick?: () => void;
  infoTooltip?: string;
}

const StepWizardModal: React.FC<StepWizardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  steps,
  currentStep,
  setCurrentStep,
  children,
  error,
  loading = false,
  submitButtonText = "Create",
  showInfoButton = false,
  onInfoClick,
  infoTooltip
}) => {
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

  const resetModal = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepData = steps[currentStep - 1];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
        onClick={handleClose}
      />
      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Modal */}
          <div className="relative w-full max-w-4xl glass-card animate-scale-in max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-white/70">{currentStepData?.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {showInfoButton && (
                      <button
                        type="button"
                        onClick={onInfoClick}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        title={infoTooltip}
                      >
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
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
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-shrink-0">
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
                {children}
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
                          <span>{submitButtonText}</span>
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
    </>
  );
};

export default StepWizardModal;