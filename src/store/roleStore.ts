import { create } from 'zustand';
import { Role } from '@/lib/types';
import api from '@/lib/api';

type RoleState = {
  roles: Role[] | null;
  isLoading: boolean;
  fetchRoles: () => Promise<void>;
};

export const useRoleStore = create<RoleState>((set) => ({
  roles: null,
  isLoading: false,
  fetchRoles: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/roles');
      set({ roles: data });
    } catch {
      set({ roles: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
