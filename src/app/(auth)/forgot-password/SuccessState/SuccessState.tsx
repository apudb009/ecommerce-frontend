import { ArrowLeft, CheckCircle } from 'lucide-react';
import { FC } from 'react';
import Link from 'next/link';

type Props = {
  email: string;
  onClickTryDifferentEmail: () => void;
};

const SuccessState: FC<Props> = ({ email, onClickTryDifferentEmail }) => {
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
            onClick={onClickTryDifferentEmail}
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
};

export default SuccessState;
