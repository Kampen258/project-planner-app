import React, { useState } from 'react';
import type { AnalysisResults } from '../../services/braindumpService';

interface ReviewInterfaceComponentProps {
  results: AnalysisResults;
  onContinueToQuestions: () => void;
  onEditMore: () => void;
  onUpdateResults?: (updatedResults: AnalysisResults) => void;
}

const ReviewInterfaceComponent: React.FC<ReviewInterfaceComponentProps> = ({
  results,
  onContinueToQuestions,
  onEditMore,
  onUpdateResults
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['project-details']));
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedResults, setEditedResults] = useState<AnalysisResults>(results);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
  };

  const handleSaveEdit = () => {
    if (onUpdateResults) {
      onUpdateResults(editedResults);
    }
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditedResults(results);
    setEditingSection(null);
  };

  const { extraction, completeness } = editedResults;

  const Section: React.FC<{
    id: string;
    title: string;
    status: 'complete' | 'missing';
    children: React.ReactNode;
  }> = ({ id, title, status, children }) => {
    const isExpanded = expandedSections.has(id);
    const isEditing = editingSection === id;

    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-4">
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-t-xl"
        >
          <div className="flex items-center space-x-3">
            <span className={`text-lg ${isExpanded ? '▼' : '▶'}`}>
              {isExpanded ? '▼' : '▶'}
            </span>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'complete'
                ? 'bg-green-500/20 text-green-100'
                : 'bg-orange-500/20 text-orange-100'
            }`}>
              {status === 'complete' ? 'Complete ✅' : 'Missing ⚠️'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(id);
            }}
            className="text-blue-300 hover:text-blue-100 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            Edit
          </button>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-white/10">
            {isEditing ? (
              <div className="space-y-3 pt-4">
                {children}
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4">{children}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Analysis Review</h1>
          <p className="text-white/80">Review and edit all extracted information before proceeding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Review Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Project Details */}
            <Section id="project-details" title="PROJECT DETAILS" status="complete">
              <div className="space-y-3 text-white">
                <div>
                  <label className="block text-white/80 text-sm mb-1">Title:</label>
                  <p className="bg-white/10 p-2 rounded">{extraction.project.title}</p>
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">Description:</label>
                  <p className="bg-white/10 p-2 rounded">{extraction.project.description}</p>
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">Type:</label>
                  <p className="bg-white/10 p-2 rounded">{extraction.project.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
              </div>
            </Section>

            {/* Goals & Objectives */}
            <Section
              id="goals"
              title="GOALS & OBJECTIVES"
              status={extraction.context.goals_and_objectives.extracted ? 'complete' : 'missing'}
            >
              <div className="space-y-3 text-white">
                <div>
                  <label className="block text-white/80 text-sm mb-1">Primary Goal:</label>
                  <p className="bg-white/10 p-2 rounded">{extraction.context.goals_and_objectives.primary_goal}</p>
                </div>
                {extraction.context.goals_and_objectives.key_objectives.length > 0 && (
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Key Objectives:</label>
                    <ul className="space-y-1">
                      {extraction.context.goals_and_objectives.key_objectives.map((objective, index) => (
                        <li key={index} className="bg-white/10 p-2 rounded flex items-start">
                          <span className="mr-2">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>

            {/* Features Identified */}
            <Section id="features" title={`FEATURES IDENTIFIED (${extraction.context.features.length})`} status="complete">
              <div className="space-y-2">
                {extraction.context.features.map((feature, index) => (
                  <div key={index} className="bg-white/10 p-3 rounded">
                    <h4 className="font-medium text-white mb-1">{index + 1}. {feature.name}</h4>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                    <p className="text-white/60 text-xs mt-1">~{feature.task_count} tasks</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Tasks Extracted */}
            <Section id="tasks" title={`TASKS EXTRACTED (${extraction.context.tasks.length})`} status="complete">
              <div className="space-y-3">
                {extraction.context.features.map((feature, featureIndex) => {
                  const featureTasks = extraction.context.tasks.filter(task => task.feature === feature.name);
                  if (featureTasks.length === 0) return null;

                  return (
                    <div key={featureIndex} className="bg-white/5 p-3 rounded">
                      <h4 className="font-medium text-white mb-2">{feature.name}:</h4>
                      <div className="space-y-1 ml-4">
                        {featureTasks.slice(0, 5).map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-start space-x-2 text-white/80 text-sm">
                            <span className="text-green-300">✓</span>
                            <span>{task.title}</span>
                          </div>
                        ))}
                        {featureTasks.length > 5 && (
                          <div className="text-white/60 text-xs ml-6">
                            ... and {featureTasks.length - 5} more tasks
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Timeline */}
            <Section
              id="timeline"
              title="TIMELINE"
              status={extraction.context.timeline.extracted ? 'complete' : 'missing'}
            >
              <div className="space-y-3 text-white">
                {extraction.context.timeline.start_date && (
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Start Date:</label>
                    <p className="bg-white/10 p-2 rounded">{extraction.context.timeline.start_date}</p>
                  </div>
                )}
                {extraction.context.timeline.end_date && (
                  <div>
                    <label className="block text-white/80 text-sm mb-1">End Date:</label>
                    <p className="bg-white/10 p-2 rounded">{extraction.context.timeline.end_date}</p>
                  </div>
                )}
                {extraction.context.timeline.duration && (
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Duration:</label>
                    <p className="bg-white/10 p-2 rounded">{extraction.context.timeline.duration}</p>
                  </div>
                )}
                {!extraction.context.timeline.extracted && (
                  <p className="text-white/60 italic">No timeline information found in document</p>
                )}
              </div>
            </Section>

            {/* Budget & Resources */}
            <Section
              id="budget"
              title="BUDGET & RESOURCES"
              status={extraction.context.budget_and_resources.extracted ? 'complete' : 'missing'}
            >
              <div className="space-y-3 text-white">
                {extraction.context.budget_and_resources.budget_amount && (
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Budget:</label>
                    <p className="bg-white/10 p-2 rounded">${extraction.context.budget_and_resources.budget_amount.toLocaleString()}</p>
                  </div>
                )}
                {extraction.context.budget_and_resources.team_size && (
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Team Size:</label>
                    <p className="bg-white/10 p-2 rounded">{extraction.context.budget_and_resources.team_size} members</p>
                  </div>
                )}
                {!extraction.context.budget_and_resources.extracted && (
                  <p className="text-white/60 italic">No budget or resource information found in document</p>
                )}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Missing Information */}
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-orange-100 mb-3">Missing Information</h3>
              {completeness.incomplete_categories.length > 0 ? (
                <div className="space-y-2">
                  {completeness.incomplete_categories.map((category, index) => (
                    <div key={index} className="text-orange-100 text-sm flex items-center space-x-2">
                      <span>•</span>
                      <span>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-orange-100 text-sm">All key information has been extracted!</p>
              )}
            </div>

            {/* Success Score */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Success Score</h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white mb-1">{completeness.overall_score}%</div>
                <div className="text-white/70 text-sm">
                  {completeness.overall_score >= 60 ? '✅ Good' :
                   completeness.overall_score >= 40 ? '⚡ Moderate' : '⚠️ Needs Work'}
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${completeness.overall_score}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onContinueToQuestions}
                className="w-full bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-3 rounded-xl transition-colors font-medium border border-blue-400/30"
              >
                Continue to Questions
              </button>
              <button
                onClick={onEditMore}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-3 hover:bg-white/15 transition-all duration-300 font-medium"
              >
                Edit More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewInterfaceComponent;