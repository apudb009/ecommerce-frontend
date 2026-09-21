import { create } from 'zustand';
import api from '@/lib/api';
import { SettingStore } from '@/lib/types';

interface SettingsState {
  settings: Partial<SettingStore>;
  loading: boolean;
  isMaitenanceMode: boolean;
  setSettings: (settings: Partial<SettingStore>) => void;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loading: true,
  isMaitenanceMode: false,
  setSettings: (settings) =>
    set({
      settings,
      loading: false,
      isMaitenanceMode: typeof settings.maintenance_mode === 'boolean' && settings.maintenance_mode,
    }),

  fetchSettings: async () => {
    if (!get().loading) return;

    try {
      const { data } = await api.get('/settings');
      set({ settings: data, loading: false, isMaitenanceMode: data.maintenance_mode });
    } catch {
      set({ loading: false });
    }
  },
}));
