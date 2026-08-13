import { StoreSettings } from '@/lib/types';
import Field from '../../_utils/field';
import Section from '../../_utils/section';
import { FC } from 'react';

type Props = {
  settings: StoreSettings;
  onChangeAction: (key: keyof StoreSettings, value: unknown) => void;
};

const SocialTab: FC<Props> = ({ settings, onChangeAction: update }) => {
  return (
    <Section title="Social Media Links">
      <div className="space-y-4">
        <Field label="Facebook">
          <div className="flex">
            <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              facebook.com/
            </span>
            <input
              value={settings.social_facebook}
              onChange={(e) => update('social_facebook', e.target.value)}
              placeholder="yourpage"
              className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Field>
        <Field label="Instagram">
          <div className="flex">
            <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              instagram.com/
            </span>
            <input
              value={settings.social_instagram}
              onChange={(e) => update('social_instagram', e.target.value)}
              placeholder="yourhandle"
              className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Field>
        <Field label="Twitter / X">
          <div className="flex">
            <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              x.com/
            </span>
            <input
              value={settings.social_twitter}
              onChange={(e) => update('social_twitter', e.target.value)}
              placeholder="yourhandle"
              className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Field>
      </div>
    </Section>
  );
};

export default SocialTab;
