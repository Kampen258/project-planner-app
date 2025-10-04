import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.client';
import { UserRole } from '../lib/database.types';
import { RolePermissionManager, type UserWithRoles, type RoleType } from '../utils/role-permissions.tsx';

interface AuthContextType {
  user: User | null;
  userWithRoles: UserWithRoles | null;
  session: Session | null;
  loading: boolean;
  roles: RoleType[];
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createAdminAccount: (email: string, password: string) => Promise<{ error: any }>;
  // Role checking methods
  hasRole: (role: RoleType) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  hasElevatedPrivileges: () => boolean;
  refreshUserRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock user - authentication disabled
  const mockUser = {
    id: '57fdae24-68cb-4000-9a4d-a1abfb5e4430', // Your specific user ID
    email: 'edovankampen@outlook.com',
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      first_name: 'Edo',
      last_name: 'van Kampen',
      avatar_url: 'https://ui-avatars.com/api/?name=Edo+van+Kampen&background=random'
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as User;

  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser
  } as Session;

  const [user] = useState<User | null>(mockUser);
  const [userWithRoles, setUserWithRoles] = useState<UserWithRoles | null>(null);
  const [session] = useState<Session | null>(mockSession);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RoleType[]>([]);

  // Restored full role loading with error handling
  const refreshUserRoles = async () => {
    if (!user?.id) {
      setRoles([]);
      setUserWithRoles(null);
      return;
    }

    try {
      setLoading(true);

      // Fetch user roles from database with error handling
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.warn('Error fetching user roles (using defaults):', error);
        // Default to regular user if error
        setRoles(['user']);
      } else {
        const roleTypes = RolePermissionManager.extractRolesFromDatabase(userRoles || []);
        // If no roles found, default to 'user'
        const finalRoles = roleTypes.length > 0 ? roleTypes : ['user'];
        setRoles(finalRoles);
      }

      // Create userWithRoles object
      if (user) {
        const userWithRolesObj: UserWithRoles = {
          id: user.id,
          email: user.email || '',
          roles: roles.length > 0 ? roles : ['user']
        };
        setUserWithRoles(userWithRolesObj);
      }
    } catch (error) {
      console.warn('Error in refreshUserRoles (using defaults):', error);
      // Fallback to user role instead of crashing
      setRoles(['user']);
      if (user) {
        const userWithRolesObj: UserWithRoles = {
          id: user.id,
          email: user.email || '',
          roles: ['user']
        };
        setUserWithRoles(userWithRolesObj);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load roles when user changes
  useEffect(() => {
    if (user) {
      refreshUserRoles();
    }
  }, [user?.id]);

  // Authentication is now disabled - no real auth logic needed
  const signIn = async (email: string, password: string) => {
    console.log('Auth disabled: Mock sign in successful for', email);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    console.log('Auth disabled: Mock sign up successful for', email);
    return { error: null };
  };

  const createAdminAccount = async (email: string, password: string) => {
    console.log('Auth disabled: Mock admin account created for', email);
    return { error: null };
  };

  const signOut = async () => {
    console.log('Auth disabled: Mock sign out');
  };

  // Restored full role checking methods
  const hasRole = (role: RoleType): boolean => {
    return RolePermissionManager.hasRole(userWithRoles, role);
  };

  const isAdmin = (): boolean => {
    return RolePermissionManager.isAdmin(userWithRoles);
  };

  const isModerator = (): boolean => {
    return RolePermissionManager.isModerator(userWithRoles);
  };

  const hasElevatedPrivileges = (): boolean => {
    return RolePermissionManager.hasElevatedPrivileges(userWithRoles);
  };

  const value = {
    user,
    userWithRoles,
    session,
    loading,
    roles,
    signIn,
    signUp,
    signOut,
    createAdminAccount,
    hasRole,
    isAdmin,
    isModerator,
    hasElevatedPrivileges,
    refreshUserRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};