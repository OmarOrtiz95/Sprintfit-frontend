import api from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async register(registerData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', registerData);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/profile');
    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await api.get<{ message: string }>(`/auth/verify-email?token=${token}`);
    return data;
  },
};
