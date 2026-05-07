'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'visio_user';
const SESSION_EXPIRY_KEY = 'visio_session_expiry';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiry || Date.now() > parseInt(expiry)) {
      // Session expired — clear everything
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      localStorage.removeItem('token');
      return null;
    }
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    // Refresh 7-day expiry window on every save
    localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem('token');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Load user from localStorage immediately (no flash)
  const [user, setUserState] = useState<User | null>(() => loadStoredUser());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const validationDone = useRef(false);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    saveUser(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    setUserState(null);
    saveUser(null);
    router.push('/login');
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      const data = await api.post<any>('/auth/refresh');
      if (data?.access_token) {
        localStorage.setItem('token', data.access_token);
        // Try to get fresh user data
        try {
          const userData = await api.get<User>('/auth/me');
          setUser(userData);
          return;
        } catch { /* use existing stored user */ }
      }
    } catch {
      // Refresh failed — clear session
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    if (validationDone.current) return;
    validationDone.current = true;

    async function validateSession() {
      const storedUser = loadStoredUser();

      if (!storedUser) {
        // No valid local session — try refresh cookie as last resort
        const token = localStorage.getItem('token');
        if (!token) {
          // Definitely not logged in
          setLoading(false);
          return;
        }
        // Has a token, validate it
        try {
          const userData = await api.get<User>('/auth/me');
          setUser(userData);
        } catch {
          // Token dead and no stored user — logged out
          saveUser(null);
        }
        setLoading(false);
        return;
      }

      // We have a stored user, show them immediately (already set in useState initializer)
      setLoading(false);

      // Silently validate/refresh in background without blocking UI
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.get<User>('/auth/me');
          // Update stored user with fresh data (in case role/name changed)
          setUser(userData);
        } catch {
          // Access token expired — try refresh
          try {
            const data = await api.post<any>('/auth/refresh');
            if (data?.access_token) {
              localStorage.setItem('token', data.access_token);
              const userData = await api.get<User>('/auth/me');
              setUser(userData);
            } else {
              // Full session dead
              setUser(null);
            }
          } catch {
            // Refresh also failed — session completely dead
            setUser(null);
          }
        }
      } else {
        // No token but stored user exists — try refresh cookie
        try {
          const data = await api.post<any>('/auth/refresh');
          if (data?.access_token) {
            localStorage.setItem('token', data.access_token);
            try {
              const userData = await api.get<User>('/auth/me');
              setUser(userData);
            } catch { /* keep stored user */ }
          }
        } catch {
          // No refresh cookie either — clear
          setUser(null);
        }
      }
    }

    validateSession();
  }, [setUser]);

  const login = useCallback(async (email: string, password: string): Promise<any> => {
    const data = await api.post<any>('/auth/login', { email, password });
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout, refreshSession }}>
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
