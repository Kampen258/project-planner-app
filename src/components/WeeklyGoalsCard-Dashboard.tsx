// Weekly Goals Card - Dashboard styled version with glassmorphism design
// Matches the Dashboard's aesthetic with white/transparent styling

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SimpleAuthContext';

interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
  task_id?: string;
  day: string;
  week_start: string;
}

interface WeeklyGoalsCardDashboardProps {
  className?: string;
  onViewAll?: () => void;
}

const WeeklyGoalsCardDashboard: React.FC<WeeklyGoalsCardDashboardProps> = ({
  className = '',
  onViewAll
}) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState('');

  const today = new Date();
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDay = dayNames[today.getDay()];

  // Get start of current week (Monday)
  function getWeekStart(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  const loadGoals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const weekStart = getWeekStart();

      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .eq('day', currentDay)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data || []);

    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user?.id, currentDay]);

  const addGoal = async () => {
    if (!user?.id || !newGoalText.trim()) return;

    try {
      const newGoal = {
        text: newGoalText.trim(),
        day: currentDay,
        week_start: getWeekStart(),
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('weekly_goals')
        .insert(newGoal)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [...prev, data]);
      setNewGoalText('');

    } catch (error) {
      console.error('Failed to add goal:', error);
    }
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .update({ completed })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId ? { ...goal, completed } : goal
        )
      );

    } catch (error) {
      console.error('Failed to toggle goal:', error);
    }
  };

  const completedToday = goals.filter(g => g.completed).length;

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/20 rounded w-32"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Weekly Goals</h3>
          <p className="text-white/70 text-sm">
            Today ({completedToday}/{goals.length} done)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="View all weekly goals"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Goals Content */}
      <div className="space-y-3 mb-4">
        {goals.length === 0 ? (
          <div className="text-center py-6 text-white/60">
            <svg className="w-8 h-8 mx-auto mb-2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No goals for today</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {goals.map(goal => (
              <div key={goal.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                <button
                  onClick={() => toggleGoal(goal.id, !goal.completed)}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                    goal.completed
                      ? 'bg-green-500/80 border-green-400'
                      : 'border-white/40 hover:border-green-400'
                  }`}
                >
                  {goal.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm ${
                  goal.completed ? 'text-white/60 line-through' : 'text-white'
                }`}>
                  {goal.text}
                </span>
                {goal.task_id && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full" title="Linked to task" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new goal */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add today's goal..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addGoal();
              }
            }}
            className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
          />
          <button
            onClick={addGoal}
            disabled={!newGoalText.trim()}
            className="px-3 py-2 bg-blue-500/80 text-white rounded-lg text-sm hover:bg-blue-500 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {goals.length > 0 && (
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300"
              style={{
                width: `${goals.length > 0 ? (completedToday / goals.length) * 100 : 0}%`
              }}
            />
          </div>
          <p className="text-xs text-white/60 mt-2 text-center">
            {completedToday} of {goals.length} completed today
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyGoalsCardDashboard;