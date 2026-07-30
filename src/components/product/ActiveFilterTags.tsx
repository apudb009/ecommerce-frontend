'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

export default function ActiveFilterTags() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tags: { label: string; key: string; value?: string }[] = [];

  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');
  const minRating = searchParams.get('minRating');
  const variantValues = searchParams.get('variantValues');
  const colors = searchParams.get('colors');

  if (search) tags.push({ label: `"${search}"`, key: 'search' });
  if (minPrice) tags.push({ label: `Min $${minPrice}`, key: 'minPrice' });
  if (maxPrice) tags.push({ label: `Max $${maxPrice}`, key: 'maxPrice' });
  if (inStock) tags.push({ label: 'In Stock', key: 'inStock' });
  if (minRating) tags.push({ label: `${minRating}★ & up`, key: 'minRating' });
  if (variantValues) {
    variantValues.split(',').forEach((v) => {
      tags.push({ label: v, key: 'variantValues', value: v });
    });
  }
  if (colors) {
    colors.split(',').forEach((c) => {
      tags.push({ label: c, key: 'colors', value: c });
    });
  }

  if (tags.length === 0) return null;

  const removeTag = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && (key === 'variantValues' || key === 'colors')) {
      const current = params.get(key)?.split(',') || [];
      const updated = current.filter((v) => v !== value);
      if (updated.length > 0) params.set(key, updated.join(','));
      else params.delete(key);
    } else {
      params.delete(key);
    }

    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    router.push('/products');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Active:</span>

      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
        >
          {/* color swatch */}
          {tag.key === 'colors' && (
            <span
              className="h-3 w-3 rounded-full border border-white/50"
              style={{ backgroundColor: tag.label }}
            />
          )}
          {tag.key !== 'colors' && tag.label}
          <button
            onClick={() => removeTag(tag.key, tag.value)}
            className="ml-0.5 hover:text-blue-900"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <button onClick={clearAll} className="text-xs font-medium text-red-500 hover:underline">
        Clear All
      </button>
    </div>
  );
}
