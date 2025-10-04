import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase.client';
import type { Database, User, UserRole } from '../lib/database.types';

// Enhanced User interface that combines Supabase auth user with our custom user data
export interface EnhancedUser {
  // Supabase auth fields
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  // Our custom user fields from database
  subscription_tier?: string | null;
  subscription_status?: string | null;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  profile_data?: any;
  roles: RoleType[];
}

export type RoleType = 'admin' | 'user' | 'moderator';

interface SupabaseAuthContextType {
  // Auth state
  user: EnhancedUser | null;
  session: Session | null;
  loading: boolean;

  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;

  // User profile methods
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
  refreshUserData: () => Promise<void>;

  // Role management
  hasRole: (role: RoleType) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  hasElevatedPrivileges: () => boolean;

  // Subscription helpers
  hasActiveSubscription: () => boolean;
  hasVoiceAccess: () => boolean;
  isPro: () => boolean;

  // Database connection status
  isSupabaseConnected: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      setIsSupabaseConnected(!error);
      if (error) {
        console.warn('⚠️ Supabase connection issue:', error.message);
      } else {
        console.log('✅ Supabase connected successfully');
      }
    } catch (err) {
      console.warn('⚠️ Supabase connection test failed:', err);
      setIsSupabaseConnected(false);
    }
  };

  // Enhanced user data fetching that combines auth user with database profile
  const fetchEnhancedUserData = async (authUser: SupabaseUser): Promise<EnhancedUser> => {
    try {
      // Fetch user profile from database
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id);

      const roles: RoleType[] = userRoles?.map(ur => ur.role) || ['user'];

      // If user doesn't exist in our database, create them
      if (userError && userError.code === 'PGRST116') {
        console.log('📝 Creating new user profile in database...');

        const newUserProfile = {
          id: authUser.id,
          email: authUser.email!,
          created_at: new Date().toISOString(),
          subscription_tier: 'free',
          subscription_status: 'inactive',
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert([newUserProfile]);

        if (insertError) {
          console.error('❌ Error creating user profile:', insertError);
        } else {
          console.log('✅ User profile created successfully');

          // Add default user role
          await supabase
            .from('user_roles')
            .insert([{ user_id: authUser.id, role: 'user' }]);
        }

        return {
          id: authUser.id,
          email: authUser.email!,
          email_confirmed_at: authUser.email_confirmed_at,
          last_sign_in_at: authUser.last_sign_in_at,
          subscription_tier: 'free',
          subscription_status: 'inactive',
          roles: ['user'],
        };
      }

      // Combine auth user with database profile
      const enhancedUser: EnhancedUser = {
        id: authUser.id,
        email: authUser.email!,
        email_confirmed_at: authUser.email_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        subscription_tier: userProfile?.subscription_tier,
        subscription_status: userProfile?.subscription_status,
        subscription_start_date: userProfile?.subscription_start_date,
        subscription_end_date: userProfile?.subscription_end_date,
        profile_data: userProfile?.profile_data,
        roles,
      };

      return enhancedUser;
    } catch (error) {
      console.error('❌ Error fetching enhanced user data:', error);
      // Fallback to basic user data
      return {
        id: authUser.id,
        email: authUser.email!,
        email_confirmed_at: authUser.email_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        roles: ['user'],
      };
    }
  };

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Test connection first
        await testConnection();

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting initial session:', error);
        }

        if (mounted) {
          setSession(initialSession);

          if (initialSession?.user) {
            const enhancedUser = await fetchEnhancedUserData(initialSession.user);
            setUser(enhancedUser);
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);

        if (mounted) {
          setSession(session);
          setLoading(true);

          if (session?.user) {
            try {
              const enhancedUser = await fetchEnhancedUserData(session.user);
              setUser(enhancedUser);
            } catch (error) {
              console.error('❌ Error updating user data:', error);
              setUser(null);
            }
          } else {
            setUser(null);
          }

          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await auth.signIn(email, password);
      return { error: result.error };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await auth.signUp(email, password);
      return { error: result.error };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('❌ Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await auth.signInWithOAuth('google');
      return { error: result.error };
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await auth.resetPassword(email);
      return { error: result.error };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return { error: error as Error };
    }
  };

  // User profile methods
  const updateProfile = async (data: Partial<User>) => {
    if (!user?.id) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (!error) {
        await refreshUserData();
      }

      return { error };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return { error: error as Error };
    }
  };

  const refreshUserData = async () => {
    if (!session?.user) return;

    try {
      const enhancedUser = await fetchEnhancedUserData(session.user);
      setUser(enhancedUser);
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  };

  // Role checking methods
  const hasRole = (role: RoleType): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isModerator = (): boolean => {
    return hasRole('moderator') || hasRole('admin');
  };

  const hasElevatedPrivileges = (): boolean => {
    return hasRole('admin') || hasRole('moderator');
  };

  // Subscription helpers
  const hasActiveSubscription = (): boolean => {
    if (!user?.subscription_status) return false;
    return ['active', 'trialing'].includes(user.subscription_status);
  };

  const hasVoiceAccess = (): boolean => {
    // Admin/pro users or specific email gets voice access
    return (
      isAdmin() ||
      hasActiveSubscription() ||
      user?.email === 'dovankampen@outlook.com' ||
      user?.email === 'admin@projectflow.com' ||
      user?.subscription_tier === 'pro'
    );
  };

  const isPro = (): boolean => {
    return (
      user?.subscription_tier === 'pro' ||
      user?.subscription_tier === 'enterprise' ||
      isAdmin()
    );
  };

  const value: SupabaseAuthContextType = {
    // State
    user,
    session,
    loading,
    isSupabaseConnected,

    // Auth methods
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,

    // Profile methods
    updateProfile,
    refreshUserData,

    // Role methods
    hasRole,
    isAdmin,
    isModerator,
    hasElevatedPrivileges,

    // Subscription methods
    hasActiveSubscription,
    hasVoiceAccess,
    isPro,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Export for backward compatibility
export default SupabaseAuthProvider;