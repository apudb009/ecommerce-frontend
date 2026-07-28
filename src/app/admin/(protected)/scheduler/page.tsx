'use client';

import { Clock, CheckCircle, RefreshCw } from 'lucide-react';

const JOBS = [
  {
    name: 'Cancel Stale Pending Orders',
    schedule: 'Every hour',
    description: 'Cancels PENDING orders with no payment after 24 hours and restores stock',
    icon: '🚫',
    color: 'red',
  },
  {
    name: 'Deactivate Expired Coupons',
    schedule: 'Every day at midnight',
    description: 'Automatically deactivates coupons past their expiry date',
    icon: '🎟️',
    color: 'orange',
  },
  {
    name: 'Deactivate Expired Flash Sales',
    schedule: 'Every 5 minutes',
    description: 'Ends flash sales that have passed their end time',
    icon: '⚡',
    color: 'yellow',
  },
  {
    name: 'Low Stock Alert',
    schedule: 'Every day at 9 AM',
    description: 'Notifies admins about products with stock ≤ 5 or out of stock',
    icon: '⚠️',
    color: 'orange',
  },
  {
    name: 'Abandoned Cart Emails',
    schedule: 'Every 2 hours',
    description: 'Sends reminder emails to users who left items in cart for 2-24 hours',
    icon: '🛒',
    color: 'blue',
  },
  {
    name: 'Weekly Analytics Report',
    schedule: 'Every Monday at 8 AM',
    description: 'Sends weekly performance report email to all admin users',
    icon: '📊',
    color: 'purple',
  },
  {
    name: 'Cleanup Old Notifications',
    schedule: 'Every Sunday at midnight',
    description: 'Deletes read notifications older than 30 days',
    icon: '🧹',
    color: 'gray',
  },
  {
    name: 'Auto-Complete Shipped Orders',
    schedule: 'Every day at noon',
    description: 'Marks orders as DELIVERED if shipped for more than 7 days',
    icon: '✅',
    color: 'green',
  },
  {
    name: 'Loyalty Points Expiry',
    schedule: '1st of every month',
    description: 'Expires loyalty points that are older than 1 year',
    icon: '⭐',
    color: 'yellow',
  },
  {
    name: 'Database Health Check',
    schedule: 'Every 30 minutes',
    description: 'Pings the database to verify connectivity',
    icon: '🏥',
    color: 'blue',
  },
];

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-600',
};

export default function AdminSchedulerPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Clock className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Jobs</h1>
          <p className="text-sm text-gray-500">Automated tasks running in the background</p>
        </div>
      </div>

      {/* status banner */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-800">
            All {JOBS.length} scheduled jobs are active
          </p>
          <p className="text-xs text-green-600">Jobs run automatically — no manual action needed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {JOBS.map((job) => (
          <div key={job.name} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{job.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900">{job.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{job.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_MAP[job.color]}`}
                >
                  {job.schedule}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
