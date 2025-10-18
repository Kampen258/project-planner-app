import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../common/Navigation';

const ProjectDetailsPageDebug: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'discovery' | 'delivery' | 'test'>('test');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discovery':
        return (
          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-white text-lg mb-4">Discovery Pipeline</h3>
            <p className="text-white/70">This would be the discovery content.</p>
          </div>
        );
      case 'delivery':
        return (
          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-white text-lg mb-4">Delivery Flow</h3>
            <p className="text-white/70">This would be the delivery content with swimming lanes.</p>
          </div>
        );
      case 'test':
      default:
        return (
          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-white text-lg mb-4">Debug Test Tab</h3>
            <div className="space-y-3 text-white/70">
              <p>✅ React Router is working - Project ID: {id}</p>
              <p>✅ State management is working - Active Tab: {activeTab}</p>
              <p>✅ Navigation component is imported</p>
              <p>✅ Tailwind CSS is working</p>
              <p>✅ Basic rendering is functional</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/projects"
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 inline-flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Projects</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Project Debug - ID: {id}</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { key: 'test', label: 'Debug Test' },
              { key: 'discovery', label: 'Discovery' },
              { key: 'delivery', label: 'Delivery' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPageDebug;