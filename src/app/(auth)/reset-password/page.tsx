import type { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
