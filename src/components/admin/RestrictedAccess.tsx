import { InfoIcon } from 'lucide-react';

const RestrictedAccess = () => {
  return (
    <div className="flex items-center justify-center gap-4 rounded-lg border bg-white p-6">
      <InfoIcon className="h-8 w-8 rounded-md object-contain text-red-500" />
      <p className="text-sm text-red-500">You don&apos;t have permission to view this section</p>
    </div>
  );
};

export default RestrictedAccess;
