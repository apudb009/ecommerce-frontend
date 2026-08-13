import Section from '../../_utils/section';
import Field from '../../_utils/field';
import ImageUpload from '@/components/ui/ImageUpload';
import Toggle from '../../_utils/toggle';
import { StoreSettings } from '@/lib/types';
import { FC } from 'react';
import { inputClass } from '../../_utils/constants';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';

type Props = {
  settings: StoreSettings;
  onChangeAction: (key: keyof StoreSettings, value: unknown) => void;
};

const GeneralTab: FC<Props> = ({ settings, onChangeAction: update }) => {
  const { permissions } = useAuthStore();
  return (
    <>
      {/* store identity */}
      <Section title="Store Identity">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Store Name">
            <input
              value={settings.store_name}
              onChange={(e) => update('store_name', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Store Email">
            <input
              type="email"
              value={settings.store_email}
              onChange={(e) => update('store_email', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Phone Number">
            <input
              value={settings.store_phone}
              onChange={(e) => update('store_phone', e.target.value)}
              placeholder="+49 123 456 789"
              className={inputClass}
            />
          </Field>
          <Field label="Store Address">
            <input
              value={settings.store_address}
              onChange={(e) => update('store_address', e.target.value)}
              placeholder="Berlin, Germany"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* logo */}
      <Section title="Logo & Favicon">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Store Logo">
            <ImageUpload
              images={settings.store_logo ? [settings.store_logo] : []}
              onChange={(imgs) => update('store_logo', imgs[0] || '')}
              hasPermission={hasPermission(permissions, 'settings', 'update')}
              maxImages={1}
              folder="branding"
            />
          </Field>
          <Field label="Favicon">
            <ImageUpload
              images={settings.store_favicon ? [settings.store_favicon] : []}
              onChange={(imgs) => update('store_favicon', imgs[0] || '')}
              hasPermission={hasPermission(permissions, 'settings', 'update')}
              maxImages={1}
              folder="branding"
            />
          </Field>
        </div>
      </Section>

      {/* maintenance */}
      <Section title="Store Status">
        <Toggle
          label="Maintenance Mode"
          description="When enabled, the store shows a maintenance page to customers"
          value={settings.maintenance_mode}
          onChange={(v) =>
            hasPermission(permissions, 'settings', 'update') && update('maintenance_mode', v)
          }
          danger
        />
      </Section>
    </>
  );
};

export default GeneralTab;
