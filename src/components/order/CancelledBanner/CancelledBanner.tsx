import { Order } from '@/lib/types';
import { XCircle } from 'lucide-react';
import { FC } from 'react';

type Props = {
  order: Order;
};

const CancelledBanner: FC<Props> = ({ order }) => {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <XCircle className="h-6 w-6 shrink-0 text-red-500" />
      <div>
        <p className="font-medium text-red-700">Order {order.status.toLowerCase()}</p>
        <p className="text-sm text-red-500">
          {order.status === 'REFUNDED'
            ? 'Your refund will appear within 5-7 business days.'
            : 'This order has been cancelled.'}
        </p>
      </div>
    </div>
  );
};

export default CancelledBanner;
