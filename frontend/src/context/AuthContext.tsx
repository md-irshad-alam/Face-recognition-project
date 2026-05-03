'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

interface User {
  id: string | number;
  full_name: string;
  email: string;
  role: string;
  school_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Unified session hydration logic - now primarily used during initialization or forced refresh
  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Get fresh session data with latest role from DB
      // Note: We use /auth/refresh-token to ensure we get a new token with updated role if needed
      const data = await api.post<any>('/auth/refresh-token');
      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);
        setUser({
          id: data.user_email,
          full_name: data.user_name,
          email: data.user_email,
          role: data.role,
          school_id: data.school_id
        });
      }
    } catch (error: any) {
      console.error("Session refresh failed:", error);
      if (error.status === 401) {
        logout();
      }
    }
  }, [router]);

  // Initial load: Only runs once when the app starts or page is reloaded
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch current user data from server on reload to ensure role is fresh
          const data = await api.get<User>('/auth/me'); 
          setUser(data);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    }
    
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post<any>('/auth/login', { email, password });
      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);
        setUser({
          id: data.user_email,
          full_name: data.user_name,
          email: data.user_email,
          role: data.role,
          school_id: data.school_id
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession }}>
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
