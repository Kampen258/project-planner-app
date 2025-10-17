import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../common/Navigation';
import OpportunityModal from '../newAgile/OpportunityModal';
import type { OpportunityCreateRequest } from '../../types/newAgile';

const DesignSystemPageSafe: React.FC = () => {
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);

  const handleSaveOpportunity = async (opportunityData: OpportunityCreateRequest) => {
    console.log('Design System Demo - Opportunity Data:', opportunityData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Opportunity created successfully! (Design System Demo)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ProjectFlow Design System</h1>
          <p className="text-white/80">Design components and patterns for the Project Planner application</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column - Project Components */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Project Management Components</h2>
            <p className="text-white/80 mb-6">Core UI components used throughout the ProjectFlow application</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-400/30">Navigation</span>
              <span className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm border border-green-400/30">Project Cards</span>
              <span className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-400/30">Dashboard KPIs</span>
              <span className="bg-orange-500/20 text-orange-200 px-3 py-1 rounded-full text-sm border border-orange-400/30">Task Management</span>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Components:</h3>
              <ul className="text-white/80 space-y-1 text-sm">
                <li>• <strong>Navigation Bar</strong> - Glassmorphism header with active states</li>
                <li>• <strong>Project Cards</strong> - Progress tracking with status indicators</li>
                <li>• <strong>KPI Widgets</strong> - Dashboard metrics and charts</li>
                <li>• <strong>Team Member Cards</strong> - User profiles and activity</li>
                <li>• <strong>Task Lists</strong> - Interactive todo management</li>
                <li>• <strong>Modals & Forms</strong> - Project creation and editing</li>
                <li>• <strong>Calendar Components</strong> - Timeline and scheduling</li>
              </ul>
            </div>

            <button
              onClick={() => setShowOpportunityModal(true)}
              className="w-full bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-3 rounded-xl transition-all duration-200 border border-blue-400/30 font-semibold flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Demo Project Modal
            </button>
          </div>

          {/* Right Column - UI Elements */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">UI Elements & Patterns</h2>
            <p className="text-white/80 mb-6">Interactive elements used across ProjectFlow pages</p>

            {/* Project Status Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Project Status Card</h3>
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs border border-green-400/30">
                  In Progress
                </span>
              </div>
              <div className="text-white/70 text-sm mb-2">Progress: 68%</div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-blue-400/70 h-2 rounded-full transition-all duration-300" style={{ width: '68%' }}></div>
              </div>
            </div>

            {/* Primary Button */}
            <button className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-3 rounded-xl transition-all duration-200 border border-blue-400/30 mb-4 w-full font-semibold">
              Primary Action Button
            </button>

            {/* Form Input */}
            <div className="mb-4">
              <label className="block text-white/80 text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                placeholder="Enter project name..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
              />
            </div>

            {/* Team Member Chip */}
            <div className="mb-4">
              <div className="text-white/80 text-sm font-medium mb-2">Team Members</div>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-white text-sm flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                    JD
                  </div>
                  John Doe
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-white text-sm flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                    AS
                  </div>
                  Alice Smith
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <h4 className="text-white/90 font-medium text-sm mb-1">Design Tokens:</h4>
              <div className="font-mono text-xs text-white/70 space-y-1">
                <div>• Spacing: 4px, 8px, 16px, 24px, 32px</div>
                <div>• Border-radius: 8px, 12px, 16px, 24px</div>
                <div>• Backdrop-blur: sm, md, lg</div>
                <div>• Opacity: /5, /10, /20, /30</div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">ProjectFlow Color System</h2>
          <p className="text-white/80 mb-6">Primary colors used throughout the application for consistency and brand identity</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-full h-16 bg-blue-500 rounded-lg mb-2"></div>
              <div className="text-white/90 text-sm font-medium">Primary Blue</div>
              <div className="text-white/60 text-xs">#3B82F6</div>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-green-500 rounded-lg mb-2"></div>
              <div className="text-white/90 text-sm font-medium">Success Green</div>
              <div className="text-white/60 text-xs">#10B981</div>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-orange-500 rounded-lg mb-2"></div>
              <div className="text-white/90 text-sm font-medium">Warning Orange</div>
              <div className="text-white/60 text-xs">#F97316</div>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-red-500 rounded-lg mb-2"></div>
              <div className="text-white/90 text-sm font-medium">Error Red</div>
              <div className="text-white/60 text-xs">#EF4444</div>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-purple-500 rounded-lg mb-2"></div>
              <div className="text-white/90 text-sm font-medium">Accent Purple</div>
              <div className="text-white/60 text-xs">#8B5CF6</div>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-white/25 rounded-lg mb-2 border border-white/20"></div>
              <div className="text-white/90 text-sm font-medium">Glass White</div>
              <div className="text-white/60 text-xs">rgba(255,255,255,0.25)</div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Typography Scale</h2>
          <p className="text-white/80 mb-6">Consistent text hierarchy used across ProjectFlow interfaces</p>

          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h1 className="text-4xl font-bold text-white mb-1">Page Titles</h1>
              <div className="text-white/60 text-sm font-mono">text-4xl font-bold</div>
              <div className="text-white/50 text-xs">Used for: Dashboard headers, main page titles</div>
            </div>
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white mb-1">Section Headers</h2>
              <div className="text-white/60 text-sm font-mono">text-2xl font-bold</div>
              <div className="text-white/50 text-xs">Used for: Card titles, modal headers, section dividers</div>
            </div>
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-xl font-semibold text-white mb-1">Component Titles</h3>
              <div className="text-white/60 text-sm font-mono">text-xl font-semibold</div>
              <div className="text-white/50 text-xs">Used for: Widget titles, project names, team member names</div>
            </div>
            <div className="border-b border-white/10 pb-4">
              <p className="text-white/90 mb-1">Primary Body Text</p>
              <div className="text-white/60 text-sm font-mono">text-base text-white/90</div>
              <div className="text-white/50 text-xs">Used for: Main content, descriptions, form labels</div>
            </div>
            <div className="border-b border-white/10 pb-4">
              <p className="text-white/70 mb-1">Secondary Body Text</p>
              <div className="text-white/60 text-sm font-mono">text-base text-white/70</div>
              <div className="text-white/50 text-xs">Used for: Subtitles, helper text, timestamps</div>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Caption & Small Text</p>
              <div className="text-white/60 text-sm font-mono">text-sm text-white/50</div>
              <div className="text-white/50 text-xs">Used for: Labels, metadata, footnotes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={showOpportunityModal}
        onClose={() => setShowOpportunityModal(false)}
        onSave={handleSaveOpportunity}
        projectId="design-system-demo"
      />
    </div>
  );
};

export default DesignSystemPageSafe;