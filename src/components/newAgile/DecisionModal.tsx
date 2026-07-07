import React, { useState } from 'react';
import type { DecisionCreateRequest } from '../../types/newAgile';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (decision: DecisionCreateRequest) => Promise<void>;
  projectId: string;
}

const emptyForm = {
  title: '',
  context: '',
  options_considered: '',
  decision: '',
  rationale: '',
  evidence: '',
  owner: '',
  stakeholders: '',
  success_criteria: '',
  review_date: ''
};

const splitLines = (value: string): string[] =>
  value.split('\n').map(line => line.trim()).filter(Boolean);

// Single-step modal following the manual's Decision Log template.
// List fields use one-item-per-line textareas to keep the form lightweight.
const DecisionModal: React.FC<DecisionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.decision.trim()) {
      setError('Title and the decision itself are required');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: formData.title,
        context: formData.context,
        options_considered: splitLines(formData.options_considered).map(option => ({
          option,
          pros: [],
          cons: []
        })),
        decision: formData.decision,
        rationale: formData.rationale,
        evidence: splitLines(formData.evidence),
        owner: formData.owner,
        stakeholders: formData.stakeholders.split(',').map(s => s.trim()).filter(Boolean),
        success_criteria: splitLines(formData.success_criteria),
        review_date: formData.review_date || undefined
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save decision');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fieldClass = 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="relative w-full max-w-2xl bg-gray-800/70 backdrop-blur-md border border-gray-600/20 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
          <form onSubmit={(e) => { void handleSubmit(e); }}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Log Decision</h3>
                <p className="text-white/70">Record a key choice with its rationale and evidence</p>
              </div>
              <button type="button" onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg m-6 mb-0">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Decision Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className={fieldClass} placeholder="What was decided?" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Context</label>
                <textarea name="context" value={formData.context} onChange={handleChange} rows={3} className={fieldClass} placeholder="Why was this decision needed?" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Options Considered (one per line)</label>
                <textarea name="options_considered" value={formData.options_considered} onChange={handleChange} rows={3} className={fieldClass} placeholder={'Option A\nOption B\nDo nothing'} />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Decision *</label>
                <textarea name="decision" value={formData.decision} onChange={handleChange} rows={2} className={fieldClass} placeholder="The option chosen" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Rationale</label>
                <textarea name="rationale" value={formData.rationale} onChange={handleChange} rows={3} className={fieldClass} placeholder="Why this option was chosen" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Evidence (one per line)</label>
                <textarea name="evidence" value={formData.evidence} onChange={handleChange} rows={2} className={fieldClass} placeholder={'Link to experiment results\nLink to user research'} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Owner</label>
                  <input type="text" name="owner" value={formData.owner} onChange={handleChange} className={fieldClass} placeholder="Who made the decision" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Review Date</label>
                  <input type="date" name="review_date" value={formData.review_date} onChange={handleChange} className={fieldClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Stakeholders (comma-separated)</label>
                <input type="text" name="stakeholders" value={formData.stakeholders} onChange={handleChange} className={fieldClass} placeholder="e.g. Design, Engineering, Sales" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Success Criteria (one per line)</label>
                <textarea name="success_criteria" value={formData.success_criteria} onChange={handleChange} rows={2} className={fieldClass} placeholder="How we'll know this was the right call" />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <button type="button" onClick={handleClose} className="px-6 py-3 text-white/80 hover:text-white transition-colors" disabled={loading}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-8 py-3 btn-glass hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2">
                <span>{loading ? 'Saving...' : 'Log Decision'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DecisionModal;
