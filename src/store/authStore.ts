import { create } from 'zustand';
import { User, UserPermission } from '@/lib/types';
import { clearTokens } from '@/lib/api';
import { useCartStore } from './cartStore';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  permissions: UserPermission[];
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) =>
    set({
      user,
      permissions:
        user && user.userRole && user.userRole.permissions
          ? user.userRole.permissions.map((p) => ({
              module: p.permission.module,
              action: p.permission.action,
            }))
          : [],
      isAuthenticated: !!user,
    }),
  isAuthenticated: false,
  permissions: [],
  logout: () => {
    clearTokens();
    set({ user: null, permissions: [], isAuthenticated: false });
    //clear cart too
    useCartStore.getState().clearCart();
  },
}));
