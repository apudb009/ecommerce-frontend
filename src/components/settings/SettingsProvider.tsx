'use client';

import { useEffect } from 'react';
import { SettingStore } from '@/lib/types';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings: Partial<SettingStore>;
  children: React.ReactNode;
}) {
  const setSettings = useSettingsStore((state) => state.setSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings, setSettings]);

  return children;
}
