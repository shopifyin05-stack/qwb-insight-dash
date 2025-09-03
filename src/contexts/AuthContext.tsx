import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  loading: boolean;
  isBikram: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isBikram = user?.email === 'bray22610@gmail.com';

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('qwb_admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For demo purposes, we'll use simple credential check
      if (email === 'bray22610@gmail.com' && password === 'Hunter@05') {
        const userData = {
          id: '1',
          email: 'bray22610@gmail.com',
          full_name: 'Bikram',
          role: 'admin'
        };
        setUser(userData);
        localStorage.setItem('qwb_admin_user', JSON.stringify(userData));
        return {};
      } else {
        return { error: 'Invalid credentials' };
      }
    } catch (error) {
      return { error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qwb_admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isBikram }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}