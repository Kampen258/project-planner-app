// Home/Planner Page - Main landing page after login
// Features: Weekly Goals widget, Calendar, Daily Planning, Notes
// Glassmorphism design system with comprehensive planning functionality

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { supabase } from '../../lib/supabase';
import WeeklyGoalsCardDashboard from '../WeeklyGoalsCard-Dashboard';
import WeeklyGoalsModal from '../WeeklyGoalsModal';
import Timer from '../Timer';
import Navigation from '../common/Navigation';
import type { Task } from '../../types';

interface DailyNote {
  id: string;
  content: string;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface DailyNoteInsert {
  content: string;
  date: string;
  user_id: string;
}

const HomePagePlanner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeeklyGoalsModal, setShowWeeklyGoalsModal] = useState(false);
  const [dailyNote, setDailyNote] = useState('');
  const [savedNote, setSavedNote] = useState<DailyNote | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);


  // Format date helpers
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load today's tasks
  const loadTodayTasks = async () => {
    if (!user?.id) return;

    try {
      const today = formatDate(selectedDate);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .or(`due_date.eq.${today},due_date.is.null`)
        .in('status', ['todo', 'in_progress'])
        .order('priority', { ascending: false });

      if (error) throw error;
      setTodayTasks(data || []);
    } catch (error) {
      console.error('Failed to load today\'s tasks:', error);
    }
  };

  // Load daily note
  const loadDailyNote = async () => {
    if (!user?.id) return;

    try {
      const dateStr = formatDate(selectedDate);

      const { data, error } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSavedNote(data);
        setDailyNote(data.content);
      } else {
        setSavedNote(null);
        setDailyNote('');
      }
    } catch (error) {
      console.error('Failed to load daily note:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([loadTodayTasks(), loadDailyNote()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user?.id, selectedDate]);

  // Save daily note
  const saveDailyNote = async () => {
    if (!user?.id || dailyNote === (savedNote?.content || '')) return;

    try {
      const dateStr = formatDate(selectedDate);

      if (savedNote) {
        // Update existing note
        const { data, error } = await supabase
          .from('daily_notes')
          .update({ content: dailyNote, updated_at: new Date().toISOString() })
          .eq('id', savedNote.id)
          .select()
          .single();

        if (error) throw error;
        setSavedNote(data);
      } else {
        // Create new note
        const newNote: DailyNoteInsert = {
          content: dailyNote,
          date: dateStr,
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('daily_notes')
          .insert(newNote)
          .select()
          .single();

        if (error) throw error;
        setSavedNote(data);
      }
    } catch (error) {
      console.error('Failed to save daily note:', error);
    }
  };

  // Mock calendar events - in real app this would come from projects/tasks
  const getCalendarEvents = (date: Date) => {
    const dateStr = date.getDate();
    const events = [];

    // Sample events based on date
    if (dateStr === 9) {
      events.push({ title: 'ProjectFlow - Start', type: 'project' });
      events.push({ title: 'ProjectFlow - Start', type: 'project' });
    }
    if (dateStr === 14) {
      events.push({ title: 'PromptWise-AI - Start', type: 'development' });
    }
    if (dateStr === 15) {
      events.push({ title: 'Geboortevarief planner...', type: 'meeting' });
    }

    return events;
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Event type colors
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-500/80 text-blue-100';
      case 'meeting':
        return 'bg-green-500/80 text-green-100';
      case 'development':
        return 'bg-orange-500/80 text-orange-100';
      case 'testing':
        return 'bg-pink-500/80 text-pink-100';
      case 'launch':
        return 'bg-yellow-500/80 text-yellow-100';
      default:
        return 'bg-gray-500/80 text-gray-100';
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, month: Date): boolean => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  };

  const isSelectedDate = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <Navigation activeSection="/home" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Daily Planner</h1>
          <p className="text-white/80">{formatDisplayDate(selectedDate)}</p>
        </div>


        {/* Top Row: Today's Tasks & Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Tasks - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Today's Tasks</h2>
                <Link
                  to="/projects"
                  className="text-white/70 hover:text-white text-sm"
                >
                  View All Projects
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/10 h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : todayTasks.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <svg className="w-12 h-12 mx-auto mb-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No tasks for today</p>
                  <Link
                    to="/projects"
                    className="text-blue-300 hover:text-blue-200 text-sm mt-2 inline-block"
                  >
                    Create new tasks
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {todayTasks.map(task => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{task.name}</h3>
                          {task.description && (
                            <p className="text-white/70 text-sm mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-3 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              task.priority === 'high'
                                ? 'bg-red-500/20 text-red-300'
                                : task.priority === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-green-500/20 text-green-300'
                            }`}>
                              {task.priority} priority
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              task.status === 'in_progress'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timer - Takes 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <Timer />
          </div>
        </div>

        {/* Second Row: Weekly Goals & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Goals */}
          <div className="lg:col-span-1">
            <WeeklyGoalsCardDashboard
              onViewAll={() => setShowWeeklyGoalsModal(true)}
            />
          </div>

          {/* Notes - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Notes</h2>
                <button
                  onClick={saveDailyNote}
                  className="px-3 py-1 bg-blue-500/80 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
                  disabled={dailyNote === (savedNote?.content || '')}
                >
                  Save
                </button>
              </div>

              <textarea
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                placeholder="Write your thoughts, plans, or reflections for today..."
                className="w-full h-40 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
              />

              {savedNote && (
                <p className="text-white/60 text-xs mt-2">
                  Last saved: {new Date(savedNote.updated_at).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Overview Section - Same as Landing Page */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-white">Calendar Overview</h2>
              <h3 className="text-2xl font-light text-white/90">October 2025</h3>
            </div>
          </div>

          {/* Glass Calendar Grid */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-px mb-4">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="p-4 text-center">
                  <span className="text-white/80 font-medium text-sm">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px">
              {/* Week 1 */}
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white/60 text-sm"></span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">3</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Project Kickoff</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">4</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Design Sprint</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">5</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">6</span>
              </div>

              {/* Week 2 */}
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">7</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">8</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">9</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">10</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Team Meeting</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">11</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">12</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Development Phase</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">13</span>
              </div>

              {/* Week 3 */}
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">14</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">15</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">16</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">17</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">18</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Testing Phase</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">19</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">20</span>
              </div>

              {/* Week 4 */}
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">21</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">22</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">23</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">24</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">25</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Launch Prep</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">26</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">27</span>
              </div>

              {/* Week 5 */}
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">28</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">29</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">30</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-white/20 rounded px-1 py-0.5 mb-1">Product Launch</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white text-sm font-medium">31</span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white/60 text-sm"></span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white/60 text-sm"></span>
              </div>
              <div className="aspect-square border border-white/20 p-3 relative">
                <span className="text-white/60 text-sm"></span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Weekly Goals Modal */}
      {showWeeklyGoalsModal && (
        <WeeklyGoalsModal
          isOpen={showWeeklyGoalsModal}
          onClose={() => setShowWeeklyGoalsModal(false)}
        />
      )}
    </div>
  );
};

export default HomePagePlanner;