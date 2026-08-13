import { FC } from 'react';
import { FormProps } from '../SendNotificationTab';
import { User } from '@/lib/types';

type Props = {
  form: FormProps;
  userInfo: User | null;
};

const Preview: FC<Props> = ({ form, userInfo }) => {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Preview</h3>

      {/* notification bell preview */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium text-gray-400 uppercase">
          How it appears in notification bell
        </p>
        <div className="flex gap-3 rounded-md bg-blue-50 p-3">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {form.title || 'Notification Title'}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {form.message || 'Your notification message will appear here.'}
            </p>
            {form.link && <p className="mt-0.5 text-xs text-blue-500">→ {form.link}</p>}
            <p className="mt-1 text-xs text-gray-400">just now</p>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-700 mb-1">Send Summary:</p>
          <p>
            Target:{' '}
            <strong>
              {form.target === 'all'
                ? 'All users'
                : userInfo
                  ? userInfo.name || userInfo.username
                  : 'No user selected'}
            </strong>
          </p>
          {form.link && (
            <p>
              Link: <strong>{form.link}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
