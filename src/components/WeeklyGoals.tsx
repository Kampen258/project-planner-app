// Weekly Goals Component - Inspired by paper planner design
// Integrates with existing task system and maintains app design consistency

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SimpleAuthContext';
import type { Task } from '../types';

interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
  task_id?: string; // Link to existing task if applicable
  day: string;
  week_start: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WeeklyGoalInsert {
  text: string;
  completed?: boolean;
  task_id?: string;
  day: string;
  week_start: string;
  user_id: string;
}

const WeeklyGoals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Record<string, WeeklyGoal[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [showTaskSelector, setShowTaskSelector] = useState<string | null>(null);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  // Get start of week (Monday)
  function getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  // Format date for display
  function formatWeekRange(weekStart: string): string {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
  }

  // Load weekly goals
  const loadWeeklyGoals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', currentWeek)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group goals by day
      const goalsByDay = days.reduce((acc, day) => {
        acc[day] = data?.filter(goal => goal.day === day) || [];
        return acc;
      }, {} as Record<string, WeeklyGoal[]>);

      setGoals(goalsByDay);
    } catch (error) {
      console.error('Failed to load weekly goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load available tasks for this week
  const loadAvailableTasks = async () => {
    if (!user?.id) return;

    try {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'todo')
        .or(`due_date.lte.${weekEnd.toISOString().split('T')[0]},due_date.is.null`)
        .order('priority', { ascending: false });

      if (error) throw error;
      setAvailableTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadWeeklyGoals();
      loadAvailableTasks();
    }
  }, [user?.id, currentWeek]);

  // Add new goal (limit to 3 per day)
  const addGoal = async (day: string, text: string, taskId?: string) => {
    if (!user?.id || !text.trim() || !canAddGoal(day)) return;

    try {
      const newGoal: WeeklyGoalInsert = {
        text: text.trim(),
        day,
        week_start: currentWeek,
        user_id: user.id,
        task_id: taskId
      };

      const { data, error } = await supabase
        .from('weekly_goals')
        .insert(newGoal)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => ({
        ...prev,
        [day]: [...(prev[day] || []), data]
      }));

    } catch (error) {
      console.error('Failed to add goal:', error);
    }
  };

  // Toggle goal completion
  const toggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => {
        const updated = { ...prev };
        for (const day in updated) {
          updated[day] = updated[day].map(goal =>
            goal.id === goalId ? { ...goal, completed } : goal
          );
        }
        return updated;
      });

    } catch (error) {
      console.error('Failed to toggle goal:', error);
    }
  };

  // Delete goal
  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => {
        const updated = { ...prev };
        for (const day in updated) {
          updated[day] = updated[day].filter(goal => goal.id !== goalId);
        }
        return updated;
      });

    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  // Add task as goal
  const addTaskAsGoal = async (day: string, task: Task) => {
    await addGoal(day, task.name, task.id);
    setShowTaskSelector(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Limit goals per day to 3 maximum
  const canAddGoal = (day: string) => {
    const dayGoals = goals[day] || [];
    return dayGoals.length < 3;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">WEEKLY GOALS</h1>
        <div className="h-0.5 bg-white/30 w-full mb-4"></div>
        <p className="text-white/80 mb-4">{formatWeekRange(currentWeek)}</p>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              const prevWeek = new Date(currentWeek);
              prevWeek.setDate(prevWeek.getDate() - 7);
              setCurrentWeek(getWeekStart(prevWeek));
            }}
            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg backdrop-blur-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentWeek(getWeekStart(new Date()))}
            className="px-4 py-2 text-sm bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all"
          >
            This Week
          </button>

          <button
            onClick={() => {
              const nextWeek = new Date(currentWeek);
              nextWeek.setDate(nextWeek.getDate() + 7);
              setCurrentWeek(getWeekStart(nextWeek));
            }}
            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg backdrop-blur-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Glassmorphism Weekly Goals */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        {days.map((day, dayIndex) => (
          <div key={day} className="border-b border-white/20 last:border-b-0">
            <div className="grid grid-cols-12 min-h-[80px]">
              {/* Day Label */}
              <div className="col-span-2 bg-white/20 backdrop-blur-md border-r border-white/20 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="font-semibold text-white text-sm uppercase tracking-wide">
                    {day}
                  </h3>
                </div>
              </div>

              {/* Goals Section */}
              <div className="col-span-10 p-4">
                <div className="space-y-3">
                  {/* Display up to 3 goals with circular checkboxes */}
                  {[0, 1, 2].map((index) => {
                    const dayGoals = goals[day] || [];
                    const goal = dayGoals[index];

                    return (
                      <div key={index} className="flex items-center gap-3 min-h-[24px]">
                        {goal ? (
                          <>
                            {/* Circular checkbox */}
                            <button
                              onClick={() => toggleGoal(goal.id, !goal.completed)}
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                goal.completed
                                  ? 'bg-white/90 border-white/90'
                                  : 'border-white/50 hover:border-white/80 hover:bg-white/10'
                              }`}
                            >
                              {goal.completed && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </button>

                            {/* Goal text with underline */}
                            <div className="flex-1 group relative">
                              <div className="border-b border-white/30 pb-1">
                                <p className={`text-sm ${
                                  goal.completed
                                    ? 'text-white/60 line-through'
                                    : 'text-white'
                                }`}>
                                  {goal.text}
                                </p>
                              </div>

                              {/* Delete button */}
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="absolute -right-2 -top-1 opacity-0 group-hover:opacity-100 p-1 text-white/60 hover:text-red-400 transition-all bg-white/20 backdrop-blur-md rounded-full shadow-sm hover:bg-white/30"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Empty circular checkbox */}
                            <div className="w-5 h-5 rounded-full border-2 border-white/30 flex-shrink-0"></div>

                            {/* Empty line with add button */}
                            <div className="flex-1 relative border-b border-white/30 pb-1">
                              <div className="h-5">
                                {canAddGoal(day) && (
                                  <button
                                    onClick={() => setShowTaskSelector(showTaskSelector === `${day}-${index}` ? null : `${day}-${index}`)}
                                    className="absolute left-0 top-0 text-white/60 hover:text-white text-sm transition-colors"
                                  >
                                    + Add goal
                                  </button>
                                )}
                              </div>

                              {/* Add Goal Dropdown */}
                              {showTaskSelector === `${day}-${index}` && (
                                <div className="absolute left-0 top-8 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-10">
                                  <div className="p-3">
                                    {/* Quick Text Goal */}
                                    <div className="mb-3">
                                      <input
                                        type="text"
                                        placeholder="Enter your goal..."
                                        className="w-full px-3 py-2 text-sm bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            const target = e.target as HTMLInputElement;
                                            if (target.value.trim()) {
                                              addGoal(day, target.value);
                                              target.value = '';
                                              setShowTaskSelector(null);
                                            }
                                          }
                                        }}
                                        autoFocus
                                      />
                                    </div>

                                    {/* Available Tasks */}
                                    {availableTasks.length > 0 && (
                                      <>
                                        <div className="text-xs text-white/70 mb-2 px-1">Or select from tasks:</div>
                                        <div className="max-h-32 overflow-y-auto">
                                          {availableTasks.slice(0, 5).map(task => (
                                            <button
                                              key={task.id}
                                              onClick={() => addTaskAsGoal(day, task)}
                                              className="w-full text-left px-2 py-1 text-sm text-white hover:bg-white/20 rounded-lg truncate transition-colors"
                                            >
                                              {task.name}
                                            </button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Click outside to close dropdown */}
      {showTaskSelector && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowTaskSelector(null)}
        />
      )}
    </div>
  );
};

export default WeeklyGoals;