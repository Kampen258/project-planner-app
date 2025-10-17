import React, { useState } from 'react';
import type { Insight, InsightCategory } from '../../types/newAgile';

interface DiscoveryLogProps {
  projectId: string;
  className?: string;
}

type TabType = 'all' | InsightCategory;

const DiscoveryLog: React.FC<DiscoveryLogProps> = ({ projectId, className = '' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Mock data - in real app this would come from API
  const insights: Insight[] = [];

  const handleNewInsight = () => {
    // TODO: Open insight creation modal
    console.log('Creating new insight');
  };

  const getFilteredInsights = () => {
    if (activeTab === 'all') return insights;
    return insights.filter(insight => insight.category === activeTab);
  };

  const getCategoryIcon = (category: InsightCategory) => {
    switch (category) {
      case 'interviews':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'usability_tests':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'analytics':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'surveys':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: insights.length },
    { id: 'interviews', label: 'Interviews', count: insights.filter(i => i.category === 'interviews').length },
    { id: 'usability_tests', label: 'Usability Tests', count: insights.filter(i => i.category === 'usability_tests').length },
    { id: 'analytics', label: 'Analytics', count: insights.filter(i => i.category === 'analytics').length },
    { id: 'surveys', label: 'Surveys', count: insights.filter(i => i.category === 'surveys').length },
  ];

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-2">No insights yet</h3>
      <p className="text-white/60 mb-6">Start capturing learnings from your discovery work</p>
      <button
        onClick={handleNewInsight}
        className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-blue-400/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create First Insight</span>
      </button>
    </div>
  );

  const InsightCard = ({ insight }: { insight: Insight }) => (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                {getCategoryIcon(insight.category)}
              </div>
              <h3 className="text-lg font-bold text-white">{insight.title}</h3>
            </div>
          </div>

          <p className="text-white/70 mb-3">{insight.description}</p>

          <div className="flex items-center space-x-3 mb-3">
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getImpactColor(insight.impact_level)}`}>
              {insight.impact_level} impact
            </span>
            <span className="text-white/60 text-sm">Source: {insight.source}</span>
            {insight.actionable && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30">
                Actionable
              </span>
            )}
          </div>

          {insight.evidence.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-white/80 mb-2">Evidence:</h4>
              <ul className="text-sm text-white/70 space-y-1">
                {insight.evidence.slice(0, 3).map((evidence, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{evidence}</span>
                  </li>
                ))}
                {insight.evidence.length > 3 && (
                  <li className="text-white/50 text-xs">+{insight.evidence.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}

          {insight.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {insight.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
              {insight.tags.length > 4 && (
                <span className="text-xs text-white/50">+{insight.tags.length - 4}</span>
              )}
            </div>
          )}
        </div>

        <div className="ml-6 text-right">
          <div className="text-white/60 text-xs">
            {new Date(insight.created_at).toLocaleDateString()}
          </div>
          <div className="text-white/50 text-xs mt-1">
            by {insight.created_by}
          </div>
        </div>
      </div>

      {insight.linked_opportunities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/60">
            <span className="font-medium">Linked to:</span>
            <span className="ml-2">{insight.linked_opportunities.length} opportunities</span>
          </div>
        </div>
      )}
    </div>
  );

  const filteredInsights = getFilteredInsights();

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Discovery Log</h2>
              <p className="text-white/70">Capture insights from user research and discovery activities</p>
            </div>
          </div>

          <button
            onClick={handleNewInsight}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Insight</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                {tab.id !== 'all' && getCategoryIcon(tab.id as InsightCategory)}
                <span>{tab.label}</span>
                <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredInsights.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {filteredInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryLog;