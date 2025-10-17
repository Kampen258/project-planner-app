// Weekly Goals Modal - Popup version for quick access
// Paper planner inspired design with daily goal tracking

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SimpleAuthContext';
import type { Task } from '../types';

interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
  task_id?: string;
  day: string;
  week_start: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WeeklyGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WeeklyGoalsModal: React.FC<WeeklyGoalsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Record<string, WeeklyGoal[]>>({});
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [newGoalTexts, setNewGoalTexts] = useState<Record<string, string>>({});

  const days = [
    { name: 'MONDAY', short: 'MON' },
    { name: 'TUESDAY', short: 'TUE' },
    { name: 'WEDNESDAY', short: 'WED' },
    { name: 'THURSDAY', short: 'THU' },
    { name: 'FRIDAY', short: 'FRI' },
    { name: 'SATURDAY', short: 'SAT' },
    { name: 'SUNDAY', short: 'SUN' }
  ];

  // Get start of week (Monday)
  function getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  function formatWeekRange(weekStart: string): string {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
  }

  const loadData = async () => {
    if (!user?.id || !isOpen) return;

    try {
      setLoading(true);

      // Load weekly goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', currentWeek)
        .order('created_at', { ascending: true });

      if (goalsError) throw goalsError;

      // Group goals by day
      const goalsByDay = days.reduce((acc, day) => {
        acc[day.name] = goalsData?.filter(goal => goal.day === day.name) || [];
        return acc;
      }, {} as Record<string, WeeklyGoal[]>);

      setGoals(goalsByDay);

      // Load available tasks
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['todo', 'in_progress'])
        .or(`due_date.lte.${weekEnd.toISOString().split('T')[0]},due_date.is.null`)
        .order('priority', { ascending: false })
        .limit(10);

      if (tasksError) throw tasksError;
      setAvailableTasks(tasksData || []);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, isOpen, currentWeek]);

  const addGoal = async (day: string, text: string, taskId?: string) => {
    if (!user?.id || !text.trim()) return;

    try {
      const newGoal = {
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

      setNewGoalTexts(prev => ({ ...prev, [day]: '' }));

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-wide">WEEKLY GOALS</h2>
              <p className="text-blue-100 mt-1">{formatWeekRange(currentWeek)}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Week Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const prevWeek = new Date(currentWeek);
                    prevWeek.setDate(prevWeek.getDate() - 7);
                    setCurrentWeek(getWeekStart(prevWeek));
                  }}
                  className="p-2 text-white hover:bg-blue-600 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setCurrentWeek(getWeekStart(new Date()))}
                  className="px-3 py-1 text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                >
                  This Week
                </button>

                <button
                  onClick={() => {
                    const nextWeek = new Date(currentWeek);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setCurrentWeek(getWeekStart(nextWeek));
                  }}
                  className="p-2 text-white hover:bg-blue-600 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-blue-600 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
              {days.map((day, dayIndex) => {
                const dayGoals = goals[day.name] || [];
                const completedCount = dayGoals.filter(g => g.completed).length;
                const totalCount = dayGoals.length;

                return (
                  <div key={day.name} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    {/* Day Header */}
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">
                        {day.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>
                          {new Date(new Date(currentWeek).getTime() + dayIndex * 24 * 60 * 60 * 1000)
                            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {totalCount > 0 && (
                          <span>{completedCount}/{totalCount}</span>
                        )}
                      </div>
                    </div>

                    {/* Goals List */}
                    <div className="space-y-2 mb-4 min-h-[120px]">
                      {dayGoals.map((goal) => (
                        <div key={goal.id} className="flex items-start gap-2 group">
                          <button
                            onClick={() => toggleGoal(goal.id, !goal.completed)}
                            className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 ${
                              goal.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400 hover:border-green-400'
                            }`}
                          >
                            {goal.completed && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-tight ${
                              goal.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-900'
                            }`}>
                              {goal.text}
                            </p>
                            {goal.task_id && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-blue-600">Task</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-600 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Goal */}
                    <div className="border-t border-gray-200 pt-3">
                      <input
                        type="text"
                        placeholder="Add goal..."
                        value={newGoalTexts[day.name] || ''}
                        onChange={(e) => setNewGoalTexts(prev => ({ ...prev, [day.name]: e.target.value }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newGoalTexts[day.name]?.trim()) {
                            addGoal(day.name, newGoalTexts[day.name]);
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Add from Tasks */}
          {availableTasks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick add from your tasks:</h4>
              <div className="flex flex-wrap gap-2">
                {availableTasks.slice(0, 6).map(task => (
                  <button
                    key={task.id}
                    onClick={() => {
                      const today = new Date();
                      const dayName = days[today.getDay() === 0 ? 6 : today.getDay() - 1].name;
                      addGoal(dayName, task.name, task.id);
                    }}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 truncate max-w-48"
                  >
                    + {task.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyGoalsModal;