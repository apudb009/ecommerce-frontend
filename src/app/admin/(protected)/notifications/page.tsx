'use client';

import { useState } from 'react';
import { Bell, Send, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import SendNotificationTab from './tabs/notifications';
import NotificationHistoryTab from './tabs/history';

export default function AdminNotificationsPage() {
  const { permissions } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Bell className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>

      {/* ── TABS ────────────────────────────────────────── */}
      <div className="mb-6 flex border-b">
        {[
          { key: 'send', label: 'Send Notification', icon: Send },
          { key: 'history', label: 'Recent Activity', icon: Eye },
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

      {activeTab === 'send' && <SendNotificationTab permissions={permissions} />}
      {activeTab === 'history' && <NotificationHistoryTab permissions={permissions} />}
    </div>
  );
}
