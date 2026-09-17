import { OrderItem as Item, SettingType } from '@/lib/types';
import { FC } from 'react';
type Props = {
  item: Item;
  currencySymbol?: SettingType;
};

const OrderItem: FC<Props> = ({ item, currencySymbol }) => {
  return (
    <div
      key={item.id}
      className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{item.productName}</p>
        {item.variant && (
          <p className="text-xs text-gray-800">
            Variant: {item.variant.name} - {item.variant.value}
          </p>
        )}
        {/* ← show flash sale savings */}
        {item.salePrice && Number(item.salePrice) < Number(item.unitPrice) ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 line-through">
              {currencySymbol}
              {Number(item.unitPrice).toFixed(2)}
            </span>
            <span className="text-xs font-medium text-red-500">
              {currencySymbol}
              {Number(item.salePrice).toFixed(2)} 🔥
            </span>
            <span className="text-xs text-gray-400">× {item.quantity}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            {currencySymbol}
            {Number(item.unitPrice).toFixed(2)} × {item.quantity}
          </p>
        )}
      </div>
      <p className="shrink-0 font-medium text-gray-900">
        {currencySymbol}
        {Number(item.total).toFixed(2)}
      </p>
    </div>
  );
};

export default OrderItem;
