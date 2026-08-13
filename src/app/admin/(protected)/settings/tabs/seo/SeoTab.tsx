import { StoreSettings } from '@/lib/types';
import { inputClass } from '../../_utils/constants';
import Field from '../../_utils/field';
import Section from '../../_utils/section';
import { FC } from 'react';

type Props = {
  settings: StoreSettings;
  onChangeAction: (key: keyof StoreSettings, value: unknown) => void;
};

const SeoTab: FC<Props> = ({ settings, onChangeAction: update }) => {
  return (
    <Section title="Search Engine Optimization">
      <div className="space-y-4">
        <Field label="Meta Title" hint="Shown in browser tab and search results (max 60 chars)">
          <input
            value={settings.meta_title}
            onChange={(e) => update('meta_title', e.target.value)}
            maxLength={60}
            className={inputClass}
          />
          <p className="mt-1 text-right text-xs text-gray-400">{settings.meta_title.length}/60</p>
        </Field>
        <Field label="Meta Description" hint="Shown in search results (max 160 chars)">
          <textarea
            value={settings.meta_description}
            onChange={(e) => update('meta_description', e.target.value)}
            maxLength={160}
            rows={3}
            className={inputClass}
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {settings.meta_description.length}/160
          </p>
        </Field>

        {/* SERP Preview */}
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">Google Search Preview</p>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm font-medium text-blue-700 hover:underline">
              {settings.meta_title || 'Page Title'}
            </p>
            <p className="text-xs text-green-700">
              {process.env.NEXT_PUBLIC_SITE_URL || 'https://shopapp.com'} ›
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {settings.meta_description || 'Page description will appear here...'}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SeoTab;
