import { hasPermission } from '@/helpers/checkPermission';
import { inputClass } from '../../_utils/constants';
import Field from '../../_utils/field';
import Toggle from '../../_utils/toggle';
import Section from '../../_utils/section';
import { StoreSettings } from '@/lib/types';
import { FC } from 'react';
import { useAuthStore } from '@/store/authStore';

type Props = {
  settings: StoreSettings;
  onChangeAction: (key: keyof StoreSettings, value: unknown) => void;
};

const CommerceTab: FC<Props> = ({ settings, onChangeAction: update }) => {
  const { permissions } = useAuthStore();
  return (
    <>
      <Section title="Currency">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Currency Code">
            <input
              value={settings.currency}
              onChange={(e) => update('currency', e.target.value.toUpperCase())}
              placeholder="USD"
              className={inputClass}
            />
          </Field>
          <Field label="Currency Symbol">
            <input
              value={settings.currency_symbol}
              onChange={(e) => update('currency_symbol', e.target.value)}
              placeholder="$"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Shipping">
        <Field
          label="Free Shipping Threshold ($)"
          hint="Orders above this amount get free shipping. Set to 0 to disable."
        >
          <input
            type="number"
            value={settings.free_shipping_threshold}
            onChange={(e) => update('free_shipping_threshold', Number(e.target.value))}
            min="0"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Orders">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Cancel Window (hours)" hint="Hours customer can cancel a PENDING order">
            <input
              type="number"
              value={settings.order_cancel_hours}
              onChange={(e) => update('order_cancel_hours', Number(e.target.value))}
              min="1"
              className={inputClass}
            />
          </Field>
          <Field
            label="Auto-Deliver After (days)"
            hint="SHIPPED orders auto-marked DELIVERED after this many days"
          >
            <input
              type="number"
              value={settings.auto_deliver_days}
              onChange={(e) => update('auto_deliver_days', Number(e.target.value))}
              min="1"
              className={inputClass}
            />
          </Field>
          <Field label="Max Cart Items" hint="Maximum number of items allowed in a cart">
            <input
              type="number"
              value={settings.max_cart_items}
              onChange={(e) => update('max_cart_items', Number(e.target.value))}
              min="1"
              className={inputClass}
            />
          </Field>
          <Field
            label="Low Stock Threshold"
            hint="Show 'low stock' warning when stock ≤ this value"
          >
            <input
              type="number"
              value={settings.low_stock_threshold}
              onChange={(e) => update('low_stock_threshold', Number(e.target.value))}
              min="1"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Customer Options">
        <div className="space-y-3">
          <Toggle
            label="Allow Reviews"
            description="Let customers leave product reviews"
            value={settings.allow_reviews}
            onChange={(v) =>
              hasPermission(permissions, 'settings', 'update') && update('allow_reviews', v)
            }
          />
          <Toggle
            label="Allow Guest Checkout"
            description="Let customers checkout without an account"
            value={settings.allow_guest_checkout}
            onChange={(v) =>
              hasPermission(permissions, 'settings', 'update') && update('allow_guest_checkout', v)
            }
          />
        </div>
      </Section>

      <Section title="Loyalty Points">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Points per $1 Spent" hint="How many points earned per dollar">
            <input
              type="number"
              value={settings.loyalty_points_per_dollar}
              onChange={(e) => update('loyalty_points_per_dollar', Number(e.target.value))}
              min="0"
              className={inputClass}
            />
          </Field>
          <Field label="Points to Redeem $1" hint="How many points needed to get $1 off">
            <input
              type="number"
              value={settings.loyalty_redeem_rate}
              onChange={(e) => update('loyalty_redeem_rate', Number(e.target.value))}
              min="1"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Preview: Customer spends $50 →{' '}
          <strong>{50 * settings.loyalty_points_per_dollar} points</strong> earned. Redeeming{' '}
          {settings.loyalty_redeem_rate} points → <strong>$1.00 off</strong>
        </div>
      </Section>
    </>
  );
};

export default CommerceTab;
