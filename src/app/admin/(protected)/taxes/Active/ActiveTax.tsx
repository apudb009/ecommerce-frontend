import { Tax } from '@/lib/types';
import { Check } from 'lucide-react';
import { FC } from 'react';

type Props = {
  taxes: Tax[];
};

const ActiveTax: FC<Props> = ({ taxes }) => {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
      <Check className="h-5 w-5 text-green-600" />
      <div>
        <p className="text-sm font-medium text-green-800">
          Active Tax: {taxes.find((t) => t.isActive)?.name}
        </p>
        <p className="text-xs text-green-600">
          {taxes.find((t) => t.isActive)?.type === 'PERCENTAGE'
            ? `${taxes.find((t) => t.isActive)?.rate}%`
            : `$${taxes.find((t) => t.isActive)?.rate}`}{' '}
          applied to all orders
        </p>
      </div>
    </div>
  );
};

export default ActiveTax;
