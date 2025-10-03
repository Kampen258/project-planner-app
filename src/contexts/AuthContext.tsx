import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createAdminAccount: (email: string, password: string) => Promise<{ error: any }>;
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
    id: 'mock-user-id',
    email: 'user@demo.com',
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
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
  const [session] = useState<Session | null>(mockSession);
  const [loading] = useState(false);

  // Authentication is now disabled - no real auth logic needed

  const signIn = async (email: string, password: string) => {
    // Authentication disabled - always return success
    console.log('Auth disabled: Mock sign in successful for', email);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    // Authentication disabled - always return success
    console.log('Auth disabled: Mock sign up successful for', email);
    return { error: null };
  };

  const createAdminAccount = async (email: string, password: string) => {
    // Authentication disabled - always return success
    console.log('Auth disabled: Mock admin account created for', email);
    return { error: null };
  };

  const signOut = async () => {
    // Authentication disabled - no-op
    console.log('Auth disabled: Mock sign out');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    createAdminAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};