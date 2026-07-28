import { create } from 'zustand';
import { User } from '@/lib/types';
import { clearTokens } from '@/lib/api';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  logout: () => {
    clearTokens();
    set({ user: null });
  },
}));
