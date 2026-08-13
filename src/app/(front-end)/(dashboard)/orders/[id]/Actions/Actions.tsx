import { Order } from '@/lib/types';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

type Props = {
  canCancel: boolean;
  cancelling: boolean;
  order: Order;
  downloading: boolean;
  onReturnRequestClick: () => void;
  handleDownloadInvoice: () => void;
  handleCancel: () => void;
};

const Actions: FC<Props> = ({
  canCancel,
  cancelling,
  order,
  downloading,
  onReturnRequestClick,
  handleDownloadInvoice,
  handleCancel,
}) => {
  {
    /* ── ACTIONS ───────────────────────────────────────── */
  }
  return (
    <div className="flex gap-3">
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="rounded-md border border-red-300 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}

      {order.status === 'DELIVERED' && (
        <Link
          href={`/products`}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Buy Again
        </Link>
      )}
      {order.status === 'DELIVERED' && !order.returnRequest && (
        <button
          onClick={onReturnRequestClick}
          className="rounded-md border border-orange-300 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
        >
          Request Return
        </button>
      )}
      <button
        onClick={handleDownloadInvoice}
        disabled={downloading}
        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {downloading ? 'Generating PDF...' : 'Download Invoice'}
      </button>
    </div>
  );
};

export default Actions;
