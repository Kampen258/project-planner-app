import React from 'react';
import type { AnalysisResults } from '../../services/braindumpService';

interface ResultsPresentationComponentProps {
  results: AnalysisResults;
  onReviewEverything: () => void;
  onContinueToInterview: () => void;
}

const ResultsPresentationComponent: React.FC<ResultsPresentationComponentProps> = ({
  results,
  onReviewEverything,
  onContinueToInterview
}) => {
  const { extraction, completeness } = results;

  const formatTaskCount = (count: number) => {
    if (count === 1) return '1 task';
    return `${count} tasks`;
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return 'Timeline to be determined';
    return duration;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Analysis Complete!</h2>
          </div>
        </div>

        {/* AI Message */}
        <div className="p-6">
          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              {/* AI Avatar */}
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>

              {/* AI Message Content */}
              <div className="flex-1 space-y-4">
                <p className="text-white font-medium">
                  Great document! I've analyzed everything and here's what I found:
                </p>

                {/* Project Overview */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold text-lg mb-3 flex items-center">
                    <span className="text-blue-300 mr-2">📊</span>
                    PROJECT OVERVIEW
                  </h3>
                  <div className="space-y-2 text-white/90">
                    <p><strong>Your project:</strong> {extraction.project.title}</p>
                    <p><strong>Type:</strong> {extraction.project.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p><strong>Description:</strong> {extraction.project.description}</p>
                  </div>
                </div>

                {/* What's Complete */}
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                  <h3 className="text-green-100 font-semibold text-lg mb-3 flex items-center">
                    <span className="text-green-300 mr-2">✅</span>
                    WHAT'S COMPLETE
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-green-100">
                    {extraction.context.features.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span>•</span>
                        <span>Clear feature breakdown ({extraction.context.features.length} features)</span>
                      </div>
                    )}
                    {extraction.context.tasks.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span>•</span>
                        <span>Detailed task list ({formatTaskCount(extraction.context.tasks.length)})</span>
                      </div>
                    )}
                    {extraction.context.timeline.extracted && (
                      <div className="flex items-center space-x-2">
                        <span>•</span>
                        <span>Development timeline ({formatDuration(extraction.context.timeline.duration)})</span>
                      </div>
                    )}
                    {extraction.context.goals_and_objectives.extracted && (
                      <div className="flex items-center space-x-2">
                        <span>•</span>
                        <span>Goals and objectives defined</span>
                      </div>
                    )}
                    {extraction.context.budget_and_resources.extracted && (
                      <div className="flex items-center space-x-2">
                        <span>•</span>
                        <span>Budget and resources specified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* What's Missing */}
                {completeness.incomplete_categories.length > 0 && (
                  <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-4">
                    <h3 className="text-orange-100 font-semibold text-lg mb-3 flex items-center">
                      <span className="text-orange-300 mr-2">⚠️</span>
                      WHAT I NEED TO KNOW
                    </h3>
                    <div className="space-y-2 text-orange-100">
                      {completeness.incomplete_categories.map((category, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span>•</span>
                          <span>{formatCategoryName(category)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Score */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">Current Success Score</h3>
                      <p className="text-white/80">Based on information extracted from your document</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white mb-1">{completeness.overall_score}%</div>
                      <div className="text-white/70 text-sm">
                        {completeness.overall_score >= 60 ? '✅ Good' :
                         completeness.overall_score >= 40 ? '⚡ Moderate' : '⚠️ Needs Work'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-3 mt-4">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${completeness.overall_score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="pt-4">
                  <p className="text-white font-medium mb-4">
                    {completeness.questions_needed > 0
                      ? `Should I create the project and ask these ${completeness.questions_needed} questions, or would you like to review everything first?`
                      : 'Your project looks comprehensive! Ready to create it?'
                    }
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onReviewEverything}
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-3 hover:bg-white/15 transition-all duration-300 font-medium"
                    >
                      Review Everything
                    </button>
                    <button
                      onClick={onContinueToInterview}
                      className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-3 rounded-xl transition-colors font-medium border border-blue-400/30"
                    >
                      {completeness.questions_needed > 0 ? 'Continue & Ask Me' : 'Create Project'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{results.metadata.word_count.toLocaleString()}</div>
              <div className="text-white/70 text-sm">Words Analyzed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{extraction.context.features.length}</div>
              <div className="text-white/70 text-sm">Features Found</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{extraction.context.tasks.length}</div>
              <div className="text-white/70 text-sm">Tasks Extracted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format category names
const formatCategoryName = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'goals_and_objectives': 'What are your goals and objectives?',
      'target_audience': 'Who is your target audience?',
      'budget_and_resources': 'What is your budget and team?',
      'timeline': 'What is your timeline?',
      'success_criteria': 'How will you measure success?',
      'risks_concerns': 'What are your biggest concerns?',
      'stakeholders': 'Who are the key stakeholders?',
      'external_resources': 'Any external dependencies?'
    };

    return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default ResultsPresentationComponent;