'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS STATE ──────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
            <p className="mt-2 text-gray-500">
              If <strong>{email}</strong> is registered, you&apos;ll receive a password reset link
              within a few minutes.
            </p>

            <div className="mt-6 rounded-lg bg-blue-50 p-4 text-left text-sm text-blue-700">
              <p className="font-medium">Didn&apos;t receive the email?</p>
              <ul className="mt-1 space-y-1 text-blue-600">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Link expires in 30 minutes</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="mt-4 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Try a different email
            </button>

            <Link
              href="/login"
              className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ─────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Enter your email and we&apos;ll send you a reset link
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
