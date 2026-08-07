'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Settings, Save, Store, DollarSign, Share2, Search, InfoIcon } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_logo: string;
  store_favicon: string;
  currency: string;
  currency_symbol: string;
  maintenance_mode: boolean;
  allow_reviews: boolean;
  allow_guest_checkout: boolean;
  free_shipping_threshold: number;
  max_cart_items: number;
  low_stock_threshold: number;
  order_cancel_hours: number;
  auto_deliver_days: number;
  loyalty_points_per_dollar: number;
  loyalty_redeem_rate: number;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  meta_title: string;
  meta_description: string;
}

type Tab = 'general' | 'commerce' | 'social' | 'seo';

export default function AdminSettingsPage() {
  const { permissions } = useAuthStore();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

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

  if (loading || !settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

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
              <>
                {/* store identity */}
                <Section title="Store Identity">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Store Name">
                      <input
                        value={settings.store_name}
                        onChange={(e) => update('store_name', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Store Email">
                      <input
                        type="email"
                        value={settings.store_email}
                        onChange={(e) => update('store_email', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Phone Number">
                      <input
                        value={settings.store_phone}
                        onChange={(e) => update('store_phone', e.target.value)}
                        placeholder="+49 123 456 789"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Store Address">
                      <input
                        value={settings.store_address}
                        onChange={(e) => update('store_address', e.target.value)}
                        placeholder="Berlin, Germany"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </Section>

                {/* logo */}
                <Section title="Logo & Favicon">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="Store Logo">
                      <ImageUpload
                        images={settings.store_logo ? [settings.store_logo] : []}
                        onChange={(imgs) => update('store_logo', imgs[0] || '')}
                        hasPermission={hasPermission(permissions, 'settings', 'update')}
                        maxImages={1}
                        folder="branding"
                      />
                    </Field>
                    <Field label="Favicon">
                      <ImageUpload
                        images={settings.store_favicon ? [settings.store_favicon] : []}
                        onChange={(imgs) => update('store_favicon', imgs[0] || '')}
                        hasPermission={hasPermission(permissions, 'settings', 'update')}
                        maxImages={1}
                        folder="branding"
                      />
                    </Field>
                  </div>
                </Section>

                {/* maintenance */}
                <Section title="Store Status">
                  <Toggle
                    label="Maintenance Mode"
                    description="When enabled, the store shows a maintenance page to customers"
                    value={settings.maintenance_mode}
                    onChange={(v) =>
                      hasPermission(permissions, 'settings', 'update') &&
                      update('maintenance_mode', v)
                    }
                    danger
                  />
                </Section>
              </>
            )}

            {/* ── COMMERCE TAB ────────────────────────────── */}
            {activeTab === 'commerce' && (
              <>
                <Section title="Currency">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Currency Code">
                      <input
                        value={settings.currency}
                        onChange={(e) => update('currency', e.target.value.toUpperCase())}
                        placeholder="USD"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Currency Symbol">
                      <input
                        value={settings.currency_symbol}
                        onChange={(e) => update('currency_symbol', e.target.value)}
                        placeholder="$"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </Section>

                <Section title="Shipping">
                  <Field
                    label="Free Shipping Threshold ($)"
                    hint="Orders above this amount get free shipping. Set to 0 to disable."
                  >
                    <input
                      type="number"
                      value={settings.free_shipping_threshold}
                      onChange={(e) => update('free_shipping_threshold', Number(e.target.value))}
                      min="0"
                      className={inputClass}
                    />
                  </Field>
                </Section>

                <Section title="Orders">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label="Cancel Window (hours)"
                      hint="Hours customer can cancel a PENDING order"
                    >
                      <input
                        type="number"
                        value={settings.order_cancel_hours}
                        onChange={(e) => update('order_cancel_hours', Number(e.target.value))}
                        min="1"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Auto-Deliver After (days)"
                      hint="SHIPPED orders auto-marked DELIVERED after this many days"
                    >
                      <input
                        type="number"
                        value={settings.auto_deliver_days}
                        onChange={(e) => update('auto_deliver_days', Number(e.target.value))}
                        min="1"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Max Cart Items" hint="Maximum number of items allowed in a cart">
                      <input
                        type="number"
                        value={settings.max_cart_items}
                        onChange={(e) => update('max_cart_items', Number(e.target.value))}
                        min="1"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Low Stock Threshold"
                      hint="Show 'low stock' warning when stock ≤ this value"
                    >
                      <input
                        type="number"
                        value={settings.low_stock_threshold}
                        onChange={(e) => update('low_stock_threshold', Number(e.target.value))}
                        min="1"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </Section>

                <Section title="Customer Options">
                  <div className="space-y-3">
                    <Toggle
                      label="Allow Reviews"
                      description="Let customers leave product reviews"
                      value={settings.allow_reviews}
                      onChange={(v) =>
                        hasPermission(permissions, 'settings', 'update') &&
                        update('allow_reviews', v)
                      }
                    />
                    <Toggle
                      label="Allow Guest Checkout"
                      description="Let customers checkout without an account"
                      value={settings.allow_guest_checkout}
                      onChange={(v) =>
                        hasPermission(permissions, 'settings', 'update') &&
                        update('allow_guest_checkout', v)
                      }
                    />
                  </div>
                </Section>

                <Section title="Loyalty Points">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Points per $1 Spent" hint="How many points earned per dollar">
                      <input
                        type="number"
                        value={settings.loyalty_points_per_dollar}
                        onChange={(e) =>
                          update('loyalty_points_per_dollar', Number(e.target.value))
                        }
                        min="0"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Points to Redeem $1" hint="How many points needed to get $1 off">
                      <input
                        type="number"
                        value={settings.loyalty_redeem_rate}
                        onChange={(e) => update('loyalty_redeem_rate', Number(e.target.value))}
                        min="1"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    Preview: Customer spends $50 →{' '}
                    <strong>{50 * settings.loyalty_points_per_dollar} points</strong> earned.
                    Redeeming {settings.loyalty_redeem_rate} points → <strong>$1.00 off</strong>
                  </div>
                </Section>
              </>
            )}

            {/* ── SOCIAL TAB ──────────────────────────────── */}
            {activeTab === 'social' && (
              <Section title="Social Media Links">
                <div className="space-y-4">
                  <Field label="Facebook">
                    <div className="flex">
                      <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        facebook.com/
                      </span>
                      <input
                        value={settings.social_facebook}
                        onChange={(e) => update('social_facebook', e.target.value)}
                        placeholder="yourpage"
                        className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </Field>
                  <Field label="Instagram">
                    <div className="flex">
                      <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        instagram.com/
                      </span>
                      <input
                        value={settings.social_instagram}
                        onChange={(e) => update('social_instagram', e.target.value)}
                        placeholder="yourhandle"
                        className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </Field>
                  <Field label="Twitter / X">
                    <div className="flex">
                      <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        x.com/
                      </span>
                      <input
                        value={settings.social_twitter}
                        onChange={(e) => update('social_twitter', e.target.value)}
                        placeholder="yourhandle"
                        className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </Field>
                </div>
              </Section>
            )}

            {/* ── SEO TAB ─────────────────────────────────── */}
            {activeTab === 'seo' && (
              <Section title="Search Engine Optimization">
                <div className="space-y-4">
                  <Field
                    label="Meta Title"
                    hint="Shown in browser tab and search results (max 60 chars)"
                  >
                    <input
                      value={settings.meta_title}
                      onChange={(e) => update('meta_title', e.target.value)}
                      maxLength={60}
                      className={inputClass}
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {settings.meta_title.length}/60
                    </p>
                  </Field>
                  <Field label="Meta Description" hint="Shown in search results (max 160 chars)">
                    <textarea
                      value={settings.meta_description}
                      onChange={(e) => update('meta_description', e.target.value)}
                      maxLength={160}
                      rows={3}
                      className={inputClass}
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {settings.meta_description.length}/160
                    </p>
                  </Field>

                  {/* SERP Preview */}
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-500">Google Search Preview</p>
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-sm font-medium text-blue-700 hover:underline">
                        {settings.meta_title || 'Page Title'}
                      </p>
                      <p className="text-xs text-green-700">
                        {process.env.NEXT_PUBLIC_SITE_URL || 'https://shopapp.com'} ›
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {settings.meta_description || 'Page description will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              </Section>
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

// ── REUSABLE COMPONENTS ─────────────────────────────
const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
  danger = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-md p-3 ${
        danger && value ? 'bg-red-50' : 'bg-gray-50'
      }`}
    >
      <div>
        <p className={`text-sm font-medium ${danger && value ? 'text-red-700' : 'text-gray-900'}`}>
          {label}
          {danger && value && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
              Active
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          value ? (danger ? 'bg-red-500' : 'bg-blue-600') : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
