import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'sprintfit-token';
const USER_KEY = 'sprintfit-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [token, user]);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
     if (token) refreshProfile();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      setToken(response.access_token);
      const profile = await authService.getProfile();
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      setToken(response.access_token);
      const profile = await authService.getProfile();
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, refreshProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
