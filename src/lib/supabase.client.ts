// Enhanced Supabase client with latest 2025 best practices
// https://supabase.com/docs/reference/javascript/typescript-support

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment validation with graceful fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Missing Supabase environment variables - using mock client');
  console.warn('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.warn('App will continue with limited functionality');
}

// Enhanced client configuration following latest best practices
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://mock.supabase.co',
  SUPABASE_ANON_KEY || 'mock-anon-key',
  {
  auth: {
    // Use localStorage for web, memory for server-side
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,

    // Enable session persistence across browser sessions
    persistSession: true,

    // Auto-refresh tokens before expiry (recommended)
    autoRefreshToken: true,

    // Detect sessions from URL fragments (OAuth redirects)
    detectSessionInUrl: true,

    // Enable PKCE (Proof Key for Code Exchange) for enhanced security
    flowType: 'pkce',

    // Prevent popup blockers by opening auth URLs in same tab
    debug: process.env.NODE_ENV === 'development',
  },

  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'project-planner-app@1.0.0',
    },
  },

  // Database-specific options
  db: {
    // The Postgres schema to use
    schema: 'public',
  },

  // Realtime configuration
  realtime: {
    // Enable presence tracking
    params: {
      eventsPerSecond: 10,
    },
    // Heartbeat interval for connection health
    heartbeatIntervalMs: 30000,
    // Reconnect automatically on connection loss
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
  },
});

// Enhanced auth utilities with latest patterns
export const auth = {
  // Get session with proper error handling
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return { session: null, error };
      }
      return { session, error: null };
    } catch (err) {
      console.error('Session retrieval failed:', err);
      return { session: null, error: err as Error };
    }
  },

  // Get user with error handling
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return { user: null, error };
      }
      return { user, error: null };
    } catch (err) {
      console.error('User retrieval failed:', err);
      return { user: null, error: err as Error };
    }
  },

  // Enhanced sign in with better error handling
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      console.error('Sign in failed:', err);
      return { data: null, error: err as Error };
    }
  },

  // Enhanced sign up with email confirmation
  async signUp(email: string, password: string, options?: { redirectTo?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`,
        },
      });
      return { data, error };
    } catch (err) {
      console.error('Sign up failed:', err);
      return { data: null, error: err as Error };
    }
  },

  // Sign out with cleanup
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('Sign out failed:', err);
      return { error: err as Error };
    }
  },

  // OAuth sign in (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'facebook') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { data, error };
    } catch (err) {
      console.error('OAuth sign in failed:', err);
      return { data: null, error: err as Error };
    }
  },

  // Password reset
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { data, error };
    } catch (err) {
      console.error('Password reset failed:', err);
      return { data: null, error: err as Error };
    }
  },
};

// Database utilities with enhanced error handling
export const db = {
  // Get table reference with type safety
  table: <T extends keyof Database['public']['Tables']>(name: T) => {
    return supabase.from(name);
  },

  // Execute RPC with type safety
  rpc: <T extends keyof Database['public']['Functions']>(
    name: T,
    params?: Database['public']['Functions'][T]['Args']
  ) => {
    return supabase.rpc(name, params);
  },

  // Storage bucket utilities
  storage: {
    upload: async (bucket: string, path: string, file: File) => {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });
        return { data, error };
      } catch (err) {
        console.error('Storage upload failed:', err);
        return { data: null, error: err as Error };
      }
    },

    getPublicUrl: (bucket: string, path: string) => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },
  },
};

// Realtime utilities
export const realtime = {
  // Subscribe to table changes with enhanced options
  subscribeToTable: <T extends keyof Database['public']['Tables']>(
    table: T,
    callback: (payload: any) => void,
    options?: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      schema?: string;
      filter?: string;
    }
  ) => {
    return supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: options?.schema || 'public',
          table: table as string,
          filter: options?.filter,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to presence (user online status)
  subscribeToPresence: (room: string, callback: (payload: any) => void) => {
    return supabase
      .channel(room)
      .on('presence', { event: 'sync' }, callback)
      .on('presence', { event: 'join' }, callback)
      .on('presence', { event: 'leave' }, callback)
      .subscribe();
  },
};

// Performance monitoring and debugging
export const debug = {
  // Monitor query performance in development
  enableQueryLogging: () => {
    if (process.env.NODE_ENV === 'development') {
      // Add performance monitoring for slow queries
      const originalFrom = supabase.from;
      supabase.from = function(table: string) {
        const startTime = Date.now();
        const query = originalFrom.call(this, table);

        // Patch the execute method to log timing
        const originalThen = query.then;
        query.then = function(onFulfilled, onRejected) {
          return originalThen.call(this, (result) => {
            const duration = Date.now() - startTime;
            if (duration > 1000) {
              console.warn(`🐌 Slow query detected for table "${table}": ${duration}ms`);
            } else {
              console.debug(`⚡ Query for table "${table}": ${duration}ms`);
            }
            return onFulfilled?.(result) || result;
          }, onRejected);
        };

        return query;
      };
    }
  },

  // Connection health check
  async healthCheck() {
    try {
      const start = Date.now();
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      const duration = Date.now() - start;

      return {
        healthy: !error,
        latency: duration,
        error: error?.message,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        healthy: false,
        latency: -1,
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

// Export the original client for advanced usage
export { supabase as supabaseClient };

// Default export for backward compatibility
export default supabase;