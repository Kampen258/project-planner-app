// Weekly Goals Card - Compact version for dashboard/sidebar
// Shows today's goals with quick actions

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

interface WeeklyGoalsCardProps {
  className?: string;
  onViewAll?: () => void; // Callback to open full modal
  showAllDays?: boolean; // Show all days vs just today
}

const WeeklyGoalsCard: React.FC<WeeklyGoalsCardProps> = ({
  className = '',
  onViewAll,
  showAllDays = false
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

      let query = supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart);

      // Filter to today only if not showing all days
      if (!showAllDays) {
        query = query.eq('day', currentDay);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

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
  }, [user?.id, currentDay, showAllDays]);

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

  // Group goals by day if showing all days
  const goalsByDay = showAllDays
    ? goals.reduce((acc, goal) => {
        if (!acc[goal.day]) acc[goal.day] = [];
        acc[goal.day].push(goal);
        return acc;
      }, {} as Record<string, WeeklyGoal[]>)
    : { [currentDay]: goals };

  const todaysGoals = goals.filter(g => g.day === currentDay);
  const completedToday = todaysGoals.filter(g => g.completed).length;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900">Weekly Goals</h3>
          <p className="text-sm text-gray-500">
            {showAllDays ? 'This Week' : `Today (${completedToday}/${todaysGoals.length} done)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="View all goals"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Goals Content */}
      <div className="p-4 space-y-4">
        {showAllDays ? (
          // Show goals grouped by day
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {dayNames.map(day => {
              const dayGoals = goalsByDay[day] || [];
              if (dayGoals.length === 0) return null;

              return (
                <div key={day}>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {day === currentDay ? `${day} (Today)` : day}
                  </h4>
                  <div className="space-y-2">
                    {dayGoals.map(goal => (
                      <div key={goal.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleGoal(goal.id, !goal.completed)}
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                            goal.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {goal.completed && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-sm ${
                          goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {goal.text}
                        </span>
                        {goal.task_id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Linked to task" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Show only today's goals
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todaysGoals.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No goals for today</p>
              </div>
            ) : (
              todaysGoals.map(goal => (
                <div key={goal.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <button
                    onClick={() => toggleGoal(goal.id, !goal.completed)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 ${
                      goal.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {goal.completed && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${
                    goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {goal.text}
                  </span>
                  {goal.task_id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" title="Linked to task" />
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Add new goal (only for today view) */}
        {!showAllDays && (
          <div className="pt-3 border-t border-gray-100">
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
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addGoal}
                disabled={!newGoalText.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar for today */}
      {!showAllDays && todaysGoals.length > 0 && (
        <div className="px-4 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{
                width: `${todaysGoals.length > 0 ? (completedToday / todaysGoals.length) * 100 : 0}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {completedToday} of {todaysGoals.length} completed
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyGoalsCard;