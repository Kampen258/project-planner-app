// Timer Component - Focus timer with Regular and Pomodoro modes
// Follows glassmorphism design system

import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  className?: string;
}

type TimerMode = 'regular' | 'pomodoro';
type TimerState = 'ready' | 'running' | 'paused' | 'completed';

interface TimerSession {
  duration: number;
  completed: boolean;
  timestamp: Date;
}

const Timer: React.FC<TimerProps> = ({ className = '' }) => {
  const [mode, setMode] = useState<TimerMode>('regular');
  const [state, setState] = useState<TimerState>('ready');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer presets
  const presets = {
    regular: {
      25: 25 * 60,
      45: 45 * 60,
      60: 60 * 60,
    },
    pomodoro: {
      25: 25 * 60, // Work session
      5: 5 * 60,   // Short break
      15: 15 * 60, // Long break
    }
  };

  // Initialize audio for notifications
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    audioRef.current = {
      play: createBeepSound
    } as any;
  }, []);

  // Timer logic
  useEffect(() => {
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setState('completed');
            // Play notification sound
            if (audioRef.current) {
              try {
                audioRef.current.play();
              } catch (error) {
                console.log('Could not play notification sound');
              }
            }

            // Add session to history
            const session: TimerSession = {
              duration: initialTime,
              completed: true,
              timestamp: new Date()
            };
            setSessions(prev => [session, ...prev.slice(0, 9)]); // Keep last 10 sessions

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, timeLeft, initialTime]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  // Timer controls
  const startTimer = () => {
    if (state === 'ready') {
      setState('running');
    } else if (state === 'paused') {
      setState('running');
    }
  };

  const pauseTimer = () => {
    setState('paused');
  };

  const resetTimer = () => {
    setState('ready');
    setTimeLeft(initialTime);
  };

  const stopTimer = () => {
    setState('ready');
    setTimeLeft(initialTime);
  };

  // Change timer duration
  const setTimerDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setState('ready');
  };

  // Get today's total focused time
  const getTodaysFocusTime = (): number => {
    const today = new Date().toDateString();
    return sessions
      .filter(session => session.timestamp.toDateString() === today && session.completed)
      .reduce((total, session) => total + session.duration, 0);
  };

  const todaysFocusMinutes = Math.floor(getTodaysFocusTime() / 60);
  const todaysSessions = sessions.filter(session =>
    session.timestamp.toDateString() === new Date().toDateString() && session.completed
  ).length;

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Timer</h3>
        </div>
      </div>

      {/* Timer Mode Selection */}
      <div className="mb-6">
        <p className="text-white/70 text-sm mb-3">Timer Mode:</p>
        <div className="flex bg-white/20 rounded-xl p-1">
          <button
            onClick={() => setMode('regular')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'regular'
                ? 'bg-white/30 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Regular
          </button>
          <button
            onClick={() => setMode('pomodoro')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'pomodoro'
                ? 'bg-orange-500/50 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Pomodoro
          </button>
        </div>
      </div>

      {/* Instruction Text */}
      {state === 'ready' && (
        <div className="bg-white/10 rounded-xl p-3 mb-6">
          <p className="text-white/80 text-sm text-center">
            Choose a task and click the timer icon (▶) to start your focus session
          </p>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Progress Circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={mode === 'pomodoro' ? '#f97316' : '#3b82f6'}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-white">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wide">
              {state === 'ready' ? 'READY' :
               state === 'running' ? 'FOCUS' :
               state === 'paused' ? 'PAUSED' : 'DONE'}
            </div>
          </div>
        </div>

        {/* Quick Duration Settings */}
        {state === 'ready' && (
          <div className="flex justify-center space-x-2 mb-4">
            {Object.entries(presets[mode]).map(([minutes, seconds]) => (
              <button
                key={minutes}
                onClick={() => setTimerDuration(parseInt(minutes))}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  seconds === initialTime
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task Selection */}
      <div className="mb-6">
        <p className="text-white/80 text-sm text-center">
          {selectedTask || 'Select a task to start'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-3 mb-6">
        {state === 'ready' || state === 'paused' ? (
          <button
            onClick={startTimer}
            className="p-3 bg-green-500/80 hover:bg-green-500 text-white rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l4 4 8-8" />
            </svg>
          </button>
        ) : state === 'running' ? (
          <button
            onClick={pauseTimer}
            className="p-3 bg-yellow-500/80 hover:bg-yellow-500 text-white rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          </button>
        ) : null}

        <button
          onClick={resetTimer}
          className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {(state === 'running' || state === 'paused') && (
          <button
            onClick={stopTimer}
            className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Today's Sessions Summary */}
      <div className="bg-white/10 rounded-xl p-4">
        <h4 className="text-white font-medium text-sm mb-3">Today's Sessions</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{todaysSessions}</div>
            <div className="text-xs text-white/60">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{todaysFocusMinutes}</div>
            <div className="text-xs text-white/60">Minutes Focused</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;