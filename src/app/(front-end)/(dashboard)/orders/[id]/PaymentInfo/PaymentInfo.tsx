import { Payment } from '@/lib/types';
import { CreditCard } from 'lucide-react';
import { FC } from 'react';

type Props = {
  payment: Payment;
};

const PaymentInfo: FC<Props> = ({ payment }) => {
  return (
    <div className="mb-4 rounded-lg border bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
        <CreditCard className="h-4 w-4" />
        Payment
      </h2>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Status</span>
        <span
          className={`font-medium ${
            payment.status === 'SUCCEEDED' ? 'text-green-600' : 'text-gray-600'
          }`}
        >
          {payment.status}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-gray-500">Amount Charged</span>
        <span className="font-medium text-gray-900">
          ${Number(payment.amount).toFixed(2)} {payment.currency.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default PaymentInfo;
