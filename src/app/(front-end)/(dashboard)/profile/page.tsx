'use client';

import { useState } from 'react';
import { User, MapPin, Lock } from 'lucide-react';
import PersonalInfoTab from './PersonalInfoTab';
import AddressesTab from './AddressesTab';
import PasswordTab from './PasswordTab';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'password'>('info');

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {/* ── TABS ────────────────────────────────────────── */}
      <div className="mb-6 flex border-b">
        {[
          { key: 'info', label: 'Personal Info', icon: User },
          { key: 'addresses', label: 'Addresses', icon: MapPin },
          { key: 'password', label: 'Password', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
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

      {/* ── TAB CONTENT ─────────────────────────────────── */}
      {activeTab === 'info' && <PersonalInfoTab />}
      {activeTab === 'addresses' && <AddressesTab />}
      {activeTab === 'password' && <PasswordTab />}
    </div>
  );
}

// ── PERSONAL INFO TAB ───────────────────────────────
<PersonalInfoTab />;

// ── ADDRESSES TAB ───────────────────────────────────
<AddressesTab />;

// ── PASSWORD TAB ────────────────────────────────────
<PasswordTab />;
