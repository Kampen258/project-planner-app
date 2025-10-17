import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Temporarily disable Supabase to test if this is causing Vite hang
let supabase: any = null;

// TODO: Re-enable Supabase import after testing
// try {
//   import('../lib/supabase.client').then((module) => {
//     supabase = module.supabase;
//     console.log('✅ Supabase client loaded successfully');
//   }).catch(() => {
//     console.warn('⚠️ Supabase client not available, using mock auth');
//   });
// } catch {
//   console.warn('⚠️ Supabase client not available, using mock auth');
// }

console.log('🎭 Using mock auth (Supabase disabled for testing)');

export type RoleType = 'admin' | 'user' | 'moderator';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface UserWithRoles extends User {
  roles: RoleType[];
}

interface SimpleAuthContextType {
  user: User | null;
  userWithRoles: UserWithRoles | null;
  loading: boolean;
  roles: RoleType[];
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: RoleType) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  hasElevatedPrivileges: () => boolean;
  refreshUserRoles: () => Promise<void>;
  supabaseAvailable: boolean;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  // Mock user for testing - no external dependencies
  const mockUser: User = {
    id: 'bbb7e0a8-59b7-4486-b03b-b36e9317e26b',
    email: 'edovankampen@outlook.com',
    name: 'Edo van Kampen'
  };

  const mockRoles: RoleType[] = ['user', 'admin'];

  const mockUserWithRoles: UserWithRoles = {
    ...mockUser,
    roles: mockRoles
  };

  const [user] = useState<User | null>(mockUser);
  const [userWithRoles, setUserWithRoles] = useState<UserWithRoles | null>(mockUserWithRoles);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RoleType[]>(mockRoles);
  const supabaseAvailable = Boolean(supabase);

  // Enhanced role loading with Supabase integration and fallbacks
  const refreshUserRoles = async () => {
    if (!user?.id) {
      setRoles([]);
      setUserWithRoles(null);
      return;
    }

    setLoading(true);

    try {
      let finalRoles: RoleType[] = ['user']; // Default fallback

      if (supabase) {
        // Try to load roles from Supabase
        console.log('🔍 Fetching user roles from Supabase...');
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.warn('⚠️ Error fetching roles from Supabase, using defaults:', error.message);
          finalRoles = ['user']; // Fallback for database errors
        } else if (userRoles && userRoles.length > 0) {
          // Extract roles from database response
          finalRoles = userRoles.map((ur: any) => ur.role as RoleType);
          console.log('✅ Loaded roles from Supabase:', finalRoles);
        } else {
          console.log('📝 No roles found in database, using default');
          finalRoles = ['user'];
        }
      } else {
        // Use mock data when Supabase unavailable
        console.log('🎭 Using mock roles (Supabase unavailable)');
        finalRoles = mockRoles;
      }

      setRoles(finalRoles);

      // Update userWithRoles
      const updatedUserWithRoles: UserWithRoles = {
        ...user,
        roles: finalRoles
      };
      setUserWithRoles(updatedUserWithRoles);

    } catch (error) {
      console.error('❌ Error in refreshUserRoles:', error);
      // Ultra-safe fallback
      setRoles(['user']);
      setUserWithRoles({
        ...user,
        roles: ['user']
      });
    } finally {
      setLoading(false);
    }
  };

  // Load roles on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshUserRoles();
    }
  }, [user?.id]);

  // Simple auth methods - no external calls
  const signIn = async (email: string, password: string) => {
    console.log('Mock sign in successful for', email);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    console.log('Mock sign up successful for', email);
    return { error: null };
  };

  const signOut = async () => {
    console.log('Mock sign out');
  };

  // Simple role checking methods
  const hasRole = (role: RoleType): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return roles.includes('admin');
  };

  const isModerator = (): boolean => {
    return roles.includes('moderator') || roles.includes('admin');
  };

  const hasElevatedPrivileges = (): boolean => {
    return roles.includes('admin') || roles.includes('moderator');
  };

  const value = {
    user,
    userWithRoles,
    loading,
    roles,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isModerator,
    hasElevatedPrivileges,
    refreshUserRoles,
    supabaseAvailable,
  };

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>;
};