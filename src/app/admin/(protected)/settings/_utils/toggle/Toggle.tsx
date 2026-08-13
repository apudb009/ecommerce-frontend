import { FC } from 'react';

type Props = {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
};

const Toggle: FC<Props> = ({ label, description, value, onChange, danger = false }) => {
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
};

export default Toggle;
