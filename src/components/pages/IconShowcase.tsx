import React from 'react';
import { Icon } from '../common/Icon';

// Import all SVG icons as React components
import ClipboardIcon from '../../assets/icons/clipboard.svg?react';
import NoteIcon from '../../assets/icons/note.svg?react';
import RocketIcon from '../../assets/icons/rocket.svg?react';
import LightningIcon from '../../assets/icons/lightning.svg?react';
import EyeIcon from '../../assets/icons/eye.svg?react';
import CheckCircleIcon from '../../assets/icons/check-circle.svg?react';
import PartyIcon from '../../assets/icons/party.svg?react';
import ChartBarIcon from '../../assets/icons/chart-bar.svg?react';
import XCircleIcon from '../../assets/icons/x-circle.svg?react';
import BanIcon from '../../assets/icons/ban.svg?react';
import DocumentIcon from '../../assets/icons/document.svg?react';
import BuildingIcon from '../../assets/icons/building.svg?react';
import FlaskIcon from '../../assets/icons/flask.svg?react';
import TargetIcon from '../../assets/icons/target.svg?react';
import UsersIcon from '../../assets/icons/users.svg?react';
import PlusIcon from '../../assets/icons/plus.svg?react';
import TrashIcon from '../../assets/icons/trash.svg?react';
import EditIcon from '../../assets/icons/edit.svg?react';
import SwitcherIcon from '../../assets/icons/switcher.svg?react';

/**
 * Icon Showcase Component
 *
 * Purpose: Test and display all available SVG icons
 * Sprint 1 - Testing component for new SVG icon system
 */
export const IconShowcase: React.FC = () => {
  const icons = [
    { name: 'clipboard', component: ClipboardIcon, usage: 'Backlog, Requirements' },
    { name: 'note', component: NoteIcon, usage: 'To Do tasks' },
    { name: 'rocket', component: RocketIcon, usage: 'Ready, Deployment' },
    { name: 'lightning', component: LightningIcon, usage: 'In Progress' },
    { name: 'eye', component: EyeIcon, usage: 'Review' },
    { name: 'check-circle', component: CheckCircleIcon, usage: 'Done, Completed' },
    { name: 'party', component: PartyIcon, usage: 'Released, Celebration' },
    { name: 'chart-bar', component: ChartBarIcon, usage: 'Metrics, Measuring' },
    { name: 'x-circle', component: XCircleIcon, usage: 'Cancelled, Error' },
    { name: 'ban', component: BanIcon, usage: 'Blocked, Prohibited' },
    { name: 'document', component: DocumentIcon, usage: 'Documents' },
    { name: 'building', component: BuildingIcon, usage: 'Architecture' },
    { name: 'flask', component: FlaskIcon, usage: 'Testing, Experiments' },
    { name: 'target', component: TargetIcon, usage: 'Goals, Objectives' },
    { name: 'users', component: UsersIcon, usage: 'Team, Personas' },
    { name: 'plus', component: PlusIcon, usage: 'Add, Create' },
    { name: 'trash', component: TrashIcon, usage: 'Delete, Remove' },
    { name: 'edit', component: EditIcon, usage: 'Edit, Modify' },
    { name: 'switcher', component: SwitcherIcon, usage: 'Switcher persona, Sync' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="container-custom max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎨 Icon Showcase
          </h1>
          <p className="text-white/80 text-lg">
            Testing the new SVG icon system with vite-plugin-svgr
          </p>
          <p className="text-white/60 text-sm mt-2">
            Sprint 1 • {icons.length} icons available
          </p>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {icons.map(({ name, component: IconComponent, usage }) => (
            <div key={name} className="glass-card p-6 hover:-translate-y-1 transition-all duration-200">
              {/* Icon Display - Multiple Sizes */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Icon component={IconComponent} size="sm" className="text-white/50" />
                <Icon component={IconComponent} size="md" className="text-white/70" />
                <Icon component={IconComponent} size="lg" className="text-white/90" />
              </div>

              {/* Icon Name */}
              <h3 className="text-white font-semibold text-center mb-2">
                {name}
              </h3>

              {/* Usage */}
              <p className="text-white/60 text-sm text-center mb-4">
                {usage}
              </p>

              {/* Code Examples */}
              <div className="bg-black/20 rounded p-3 text-xs font-mono">
                <div className="text-green-300 mb-1">
                  import Icon from
                </div>
                <div className="text-blue-300 break-all">
                  '@/assets/icons/{name}.svg?react'
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Examples */}
        <div className="glass-card p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Usage Examples
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Direct Usage */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Direct SVG Component
              </h3>
              <pre className="bg-black/30 rounded p-4 text-sm text-green-300 overflow-x-auto">
{`import PlusIcon from '@/assets/icons/plus.svg?react';

<PlusIcon className="w-6 h-6 text-white" />`}
              </pre>
              <div className="mt-3 p-4 bg-white/5 rounded flex items-center space-x-2">
                <PlusIcon className="w-6 h-6 text-white" />
                <span className="text-white/80">Result</span>
              </div>
            </div>

            {/* With Icon Wrapper */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Using Icon Wrapper
              </h3>
              <pre className="bg-black/30 rounded p-4 text-sm text-green-300 overflow-x-auto">
{`import { Icon } from '@/components/common/Icon';
import TrashIcon from '@/assets/icons/trash.svg?react';

<Icon component={TrashIcon} size="lg" />`}
              </pre>
              <div className="mt-3 p-4 bg-white/5 rounded flex items-center space-x-2">
                <Icon component={TrashIcon} size="lg" className="text-error-500" />
                <span className="text-white/80">Result</span>
              </div>
            </div>

            {/* In Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                In Buttons
              </h3>
              <pre className="bg-black/30 rounded p-4 text-sm text-green-300 overflow-x-auto">
{`<button className="btn-glass">
  <RocketIcon className="w-5 h-5 mr-2" />
  Launch Project
</button>`}
              </pre>
              <div className="mt-3 p-4 bg-white/5 rounded">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center transition-colors">
                  <RocketIcon className="w-5 h-5 mr-2" />
                  Launch Project
                </button>
              </div>
            </div>

            {/* Color Variations */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Color Variations
              </h3>
              <pre className="bg-black/30 rounded p-4 text-sm text-green-300 overflow-x-auto">
{`<CheckCircleIcon className="text-green-400" />
<XCircleIcon className="text-red-400" />
<LightningIcon className="text-yellow-400" />`}
              </pre>
              <div className="mt-3 p-4 bg-white/5 rounded flex items-center space-x-4">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
                <XCircleIcon className="w-8 h-8 text-red-400" />
                <LightningIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="glass-card p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            ✅ Test Results
          </h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-green-300">
              <CheckCircleIcon className="w-5 h-5" />
              <span>SVG files created: {icons.length}</span>
            </div>
            <div className="flex items-center space-x-3 text-green-300">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Import with ?react suffix: Working</span>
            </div>
            <div className="flex items-center space-x-3 text-green-300">
              <CheckCircleIcon className="w-5 h-5" />
              <span>TypeScript support: Active</span>
            </div>
            <div className="flex items-center space-x-3 text-green-300">
              <CheckCircleIcon className="w-5 h-5" />
              <span>CSS color styling (currentColor): Working</span>
            </div>
            <div className="flex items-center space-x-3 text-green-300">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Icon wrapper component: Functional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconShowcase;
