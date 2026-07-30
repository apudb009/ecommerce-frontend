'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── validate token on mount ────────────────────────
  useEffect(() => {
    const validate = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        await api.get('/auth/validate-reset-token', {
          params: { token, email },
        });
        setTokenValid(true);
      } catch {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    void validate();
  }, [token, email]);

  // ── password strength ──────────────────────────────
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = [
    '',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ][strength];

  const passwordsMatch = password && confirm && password === confirm;
  const passwordsDontMatch = confirm && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/reset-password?email=${encodeURIComponent(email!)}`, {
        token,
        password,
      });

      setSuccess(true);

      // auto-redirect to login after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // ── loading state ──────────────────────────────────
  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // ── invalid token ──────────────────────────────────
  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Link Expired or Invalid</h1>
            <p className="mt-2 text-gray-500">
              This password reset link has expired or is invalid. Reset links are only valid for 30
              minutes.
            </p>

            <Link
              href="/forgot-password"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Request a New Reset Link
            </Link>

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

  // ── success state ──────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Password Reset!</h1>
            <p className="mt-2 text-gray-500">
              Your password has been successfully reset. Redirecting you to login...
            </p>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full animate-[shrink_3s_linear_forwards] rounded-full bg-blue-600" />
            </div>

            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── reset form ─────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900">Create New Password</h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Choose a strong password for your account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* new password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          level <= strength ? strengthColor : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      strength <= 1
                        ? 'text-red-500'
                        : strength <= 2
                          ? 'text-orange-500'
                          : strength <= 3
                            ? 'text-yellow-600'
                            : strength <= 4
                              ? 'text-blue-600'
                              : 'text-green-600'
                    }`}
                  >
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* confirm password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${
                    passwordsDontMatch
                      ? 'border-red-300 focus:ring-red-500'
                      : passwordsMatch
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* match feedback */}
              {confirm && (
                <p
                  className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                    passwordsMatch ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" /> Passwords match
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirm || password !== confirm}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
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
