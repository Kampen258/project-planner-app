import React from 'react';
import type { UserPersona } from '../../types/newAgile';

interface UserPersonasProps {
  projectId: string;
  className?: string;
}

const UserPersonas: React.FC<UserPersonasProps> = ({ projectId, className = '' }) => {
  // Mock data based on the screenshot - in real app this would come from API
  const personas: UserPersona[] = [
    {
      id: '1',
      name: 'Starter',
      description: 'First-time solo creator',
      icon: '👤',
      color: 'blue',
      needs: ['Clear onboarding', 'Quick path to value', 'Mobile-friendly tasks'],
      pain_points: ['Overwhelmed by complexity', 'Unclear where to start'],
      goals: ['Create first project', 'Learn the basics', 'See immediate progress'],
      behaviors: ['Prefers simple interfaces', 'Uses mobile frequently', 'Needs guidance'],
      demographics: {
        age_range: '22-35',
        experience_level: 'Beginner',
        occupation: 'Freelancer/Entrepreneur'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Switcher',
      description: 'Small business owner migrating from spreadsheets',
      icon: '🔄',
      color: 'purple',
      needs: ['Import tools', 'Simple automations', 'Reliability'],
      pain_points: ['Data migration anxiety', 'Learning new system'],
      goals: ['Move away from spreadsheets', 'Streamline processes', 'Scale operations'],
      behaviors: ['Risk-averse', 'Values familiarity', 'Needs reassurance'],
      demographics: {
        age_range: '35-50',
        experience_level: 'Intermediate',
        occupation: 'Small Business Owner'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Operator',
      description: 'Team coordinator (3-15 people)',
      icon: '👥',
      color: 'green',
      needs: ['Permissions', 'Shared dashboards', 'Recurring workflows', 'Status clarity'],
      pain_points: ['Team coordination complexity', 'Status tracking challenges'],
      goals: ['Improve team efficiency', 'Better visibility', 'Reduce meetings'],
      behaviors: ['Process-oriented', 'Collaborative', 'Data-driven'],
      demographics: {
        age_range: '28-45',
        experience_level: 'Advanced',
        occupation: 'Team Lead/Manager'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Advisor',
      description: 'External collaborator/client',
      icon: '🎯',
      color: 'orange',
      needs: ['Read-only access', 'Easy status views', 'Limited edit access'],
      pain_points: ['Too much information', 'Complex interfaces'],
      goals: ['Stay informed', 'Provide input', 'Track progress'],
      behaviors: ['Occasional user', 'Prefers summaries', 'Mobile-first'],
      demographics: {
        age_range: '30-60',
        experience_level: 'Various',
        occupation: 'Consultant/Client'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const handleAddCustomPersona = () => {
    // TODO: Open custom persona creation modal
    console.log('Adding custom persona');
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-400 to-blue-600 border-blue-500/30';
      case 'purple': return 'from-purple-400 to-purple-600 border-purple-500/30';
      case 'green': return 'from-green-400 to-green-600 border-green-500/30';
      case 'orange': return 'from-orange-400 to-orange-600 border-orange-500/30';
      default: return 'from-gray-400 to-gray-600 border-gray-500/30';
    }
  };

  const PersonaCard = ({ persona }: { persona: UserPersona }) => (
    <div className={`bg-gradient-to-br ${getColorClasses(persona.color)} rounded-2xl p-6 border backdrop-blur-md`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
          {persona.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{persona.name}</h3>
          <p className="text-white/80 text-sm">{persona.description}</p>
        </div>
      </div>

      {/* Needs */}
      <div className="mb-4">
        <h4 className="text-white font-semibold text-sm mb-2">Needs</h4>
        <div className="flex flex-wrap gap-1">
          {persona.needs.slice(0, 3).map(need => (
            <span key={need} className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              {need}
            </span>
          ))}
          {persona.needs.length > 3 && (
            <span className="text-xs text-white/70">+{persona.needs.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Pain Points */}
      <div className="mb-4">
        <h4 className="text-white font-semibold text-sm mb-2">Pain Points</h4>
        <ul className="text-sm text-white/90 space-y-1">
          {persona.pain_points.slice(0, 2).map((point, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-white/60 mt-0.5 text-xs">•</span>
              <span>{point}</span>
            </li>
          ))}
          {persona.pain_points.length > 2 && (
            <li className="text-white/70 text-xs">+{persona.pain_points.length - 2} more pain points</li>
          )}
        </ul>
      </div>

      {/* Goals */}
      <div className="mb-4">
        <h4 className="text-white font-semibold text-sm mb-2">Goals</h4>
        <ul className="text-sm text-white/90 space-y-1">
          {persona.goals.slice(0, 3).map((goal, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-white/60 mt-0.5 text-xs">•</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Demographics */}
      {persona.demographics && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
            {persona.demographics.age_range && (
              <div>
                <span className="font-medium">Age:</span>
                <span className="ml-1">{persona.demographics.age_range}</span>
              </div>
            )}
            {persona.demographics.experience_level && (
              <div>
                <span className="font-medium">Level:</span>
                <span className="ml-1">{persona.demographics.experience_level}</span>
              </div>
            )}
            {persona.demographics.occupation && (
              <div className="col-span-2">
                <span className="font-medium">Role:</span>
                <span className="ml-1">{persona.demographics.occupation}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">User Personas</h2>
              <p className="text-white/70">Understand your users to make better product decisions</p>
            </div>
          </div>

          <button
            onClick={handleAddCustomPersona}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Custom Persona</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {personas.map(persona => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-blue-300 font-medium mb-1">Using Personas Effectively</h4>
              <p className="text-blue-200/80 text-sm">
                Reference these personas when creating opportunities and hypotheses.
                Ask: "Which persona does this serve?" and "How does this align with their needs and goals?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPersonas;