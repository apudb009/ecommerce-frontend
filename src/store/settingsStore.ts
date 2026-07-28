import { create } from 'zustand';
import api from '@/lib/api';
import { SettingStore } from '@/lib/types';

interface SettingsState {
  settings: Partial<SettingStore>;
  loading: boolean;
  isMaitenanceMode: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  loading: true,
  isMaitenanceMode: false,

  fetchSettings: async () => {
    try {
      const { data } = await api.get('/settings');
      set({ settings: data, loading: false, isMaitenanceMode: data.maintenance_mode });
    } catch {
      set({ loading: false });
    }
  },
}));
