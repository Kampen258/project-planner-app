import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<any | null>({ email: 'demo@projectflow.com', id: 'demo-user' });
  const [session, setSession] = useState<any | null>({ user: { email: 'demo@projectflow.com', id: 'demo-user' } });
  const [loading, setLoading] = useState(false); // Start with false for now

  useEffect(() => {
    console.log('AuthProvider mounted successfully - Login disabled, demo user active');
    // Always show demo user (login disabled)
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('SignIn attempted with:', email);
    // Mock successful sign in for testing
    const mockUser = { email, id: '123' };
    setUser(mockUser);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    console.log('SignUp attempted with:', email);
    return { error: null };
  };

  const signOut = async () => {
    console.log('SignOut called');
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  console.log('AuthProvider rendering with value:', value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};