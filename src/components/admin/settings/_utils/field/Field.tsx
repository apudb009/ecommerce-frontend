import { FC } from 'react';

type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

const Field: FC<Props> = ({ label, hint, children }) => {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
};

export default Field;
