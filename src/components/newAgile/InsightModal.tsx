import React, { useState } from 'react';
import type { InsightCreateRequest, InsightCategory } from '../../types/newAgile';

interface InsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (insight: InsightCreateRequest) => Promise<void>;
  projectId: string;
}

const emptyForm = {
  title: '',
  description: '',
  category: 'other' as InsightCategory,
  source: '',
  impact_level: 'medium' as 'low' | 'medium' | 'high',
  actionable: true,
  tags: ''
};

// Insights are lightweight captures, so this is a single-step modal rather
// than the multi-step wizard used for opportunities and hypotheses.
const InsightModal: React.FC<InsightModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const resetModal = () => {
    setFormData(emptyForm);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        source: formData.source,
        evidence: [],
        impact_level: formData.impact_level,
        actionable: formData.actionable,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        linked_opportunities: []
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save insight');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="relative w-full max-w-2xl bg-gray-800/70 backdrop-blur-md border border-gray-600/20 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
          <form onSubmit={(e) => { void handleSubmit(e); }}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Capture Insight</h3>
                <p className="text-white/70">Record a learning from your discovery work</p>
              </div>
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

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg m-6 mb-0">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Form Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="What did you learn?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Describe the insight and what it means for the product"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  >
                    <option value="interviews" className="bg-gray-800">Interviews</option>
                    <option value="usability_tests" className="bg-gray-800">Usability Tests</option>
                    <option value="analytics" className="bg-gray-800">Analytics</option>
                    <option value="surveys" className="bg-gray-800">Surveys</option>
                    <option value="other" className="bg-gray-800">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Impact Level</label>
                  <select
                    name="impact_level"
                    value={formData.impact_level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  >
                    <option value="low" className="bg-gray-800">Low</option>
                    <option value="medium" className="bg-gray-800">Medium</option>
                    <option value="high" className="bg-gray-800">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Source</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="e.g. User interview with power users, onboarding funnel analysis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Comma-separated, e.g. onboarding, mobile, retention"
                />
              </div>

              <label className="flex items-center space-x-3 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="actionable"
                  checked={formData.actionable}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/20 bg-white/10"
                />
                <span className="text-sm">This insight is actionable</span>
              </label>
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
                    <span>Capture Insight</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InsightModal;
