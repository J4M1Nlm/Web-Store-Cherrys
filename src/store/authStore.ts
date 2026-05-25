import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('ct_token'),
  user: null,
  setToken: (token) => {
    localStorage.setItem('ct_token', token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('ct_token');
    set({ token: null, user: null });
  },
  isAuthenticated: () => !!get().token,
}));
