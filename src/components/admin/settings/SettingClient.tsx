'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Settings, Save, Store, DollarSign, Share2, Search, InfoIcon } from 'lucide-react';
import { hasPermission } from '@/helpers/checkPermission';
import { StoreSettings, UserPermission } from '@/lib/types';
import GeneralTab from './tabs/general';
import CommerceTab from './tabs/commerce';
import SocialTab from './tabs/social';
import SeoTab from './tabs/seo';

type Tab = 'general' | 'commerce' | 'social' | 'seo';

type Props = {
  settings: StoreSettings;
  permissions: UserPermission[];
};

export default function SettingClient({ settings: initialSettings, permissions }: Props) {
  //const { permissions } = useAuthStore();
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  //const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      // convert all values to strings for API
      const payload = Object.entries(settings).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
        {},
      );
      const { data } = await api.patch('/settings', payload);
      setSettings(data);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof StoreSettings, value: unknown) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const TABS = [
    { key: 'general', label: 'General', icon: Store },
    { key: 'commerce', label: 'Commerce', icon: DollarSign },
    { key: 'social', label: 'Social', icon: Share2 },
    { key: 'seo', label: 'SEO', icon: Search },
  ];

  return (
    <div>
      {/* ── HEADER ──────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        </div>
        {hasPermission(permissions, 'settings', 'update') && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {hasPermission(permissions, 'settings', 'read') ? (
        <>
          {/* ── TABS ────────────────────────────────────── */}
          <div className="mb-6 flex border-b">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as Tab)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-6">
            {/* ── GENERAL TAB ─────────────────────────────── */}
            {activeTab === 'general' && (
              <GeneralTab settings={settings} permissions={permissions} onChangeAction={update} />
            )}

            {/* ── COMMERCE TAB ────────────────────────────── */}
            {activeTab === 'commerce' && (
              <CommerceTab settings={settings} permissions={permissions} onChangeAction={update} />
            )}

            {/* ── SOCIAL TAB ──────────────────────────────── */}
            {activeTab === 'social' && (
              <SocialTab settings={settings} permissions={permissions} onChangeAction={update} />
            )}

            {/* ── SEO TAB ─────────────────────────────────── */}
            {activeTab === 'seo' && (
              <SeoTab settings={settings} permissions={permissions} onChangeAction={update} />
            )}
          </div>{' '}
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <InfoIcon className="mb-3 h-10 w-10 text-red-500" />
          <p className="text-gray-500">You don&apos;t have permission to view settings</p>
        </div>
      )}

      {/* ── SAVE BUTTON (bottom) ───────────────────────── */}
      <div className="mt-6 flex justify-end border-t pt-6">
        {hasPermission(permissions, 'settings', 'update') && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        )}
      </div>
    </div>
  );
}
