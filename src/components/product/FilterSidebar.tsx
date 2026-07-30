'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Star, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface Filters {
  priceRange: { min: number; max: number };
  variants: Record<string, { values: string[]; colors: string[] }>;
  categories: { id: number; name: string; slug: string; count: number }[];
}

// interface ActiveFilters {
//   search?: string;
//   categoryId?: string;
//   minPrice?: string;
//   maxPrice?: string;
//   inStock?: string;
//   minRating?: string;
//   variantName?: string;
//   variantValues?: string;
//   colors?: string;
//   sortBy?: string;
//   sortOrder?: string;
// }

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b pb-4 last:border-0">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-gray-900"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ onCloseAction }: { onCloseAction?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters | null>(null);
  const [loading, setLoading] = useState(true);

  // ── local state mirrors URL params ─────────────────
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || [],
  );
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>({});

  // ── fetch available filters ────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products/filters', {
          params: { categoryId: categoryId || undefined },
        });
        setFilters(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [categoryId]);

  // ── apply filters → update URL ─────────────────────
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // reset page on filter change
    params.set('page', '1');

    // category
    if (categoryId) params.set('categoryId', categoryId);
    else params.delete('categoryId');

    // price
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    // stock
    if (inStock) params.set('inStock', 'true');
    else params.delete('inStock');

    // rating
    if (minRating) params.set('minRating', minRating);
    else params.delete('minRating');

    // colors
    if (selectedColors.length > 0) {
      params.set('colors', selectedColors.join(','));
    } else {
      params.delete('colors');
    }

    // variant values
    const allVariantValues = Object.values(selectedVariants).flat();
    if (allVariantValues.length > 0) {
      params.set('variantValues', allVariantValues.join(','));
      // also set the variant name if only one group selected
      const keys = Object.keys(selectedVariants).filter((k) => selectedVariants[k].length > 0);
      if (keys.length === 1) params.set('variantName', keys[0]);
      else params.delete('variantName');
    } else {
      params.delete('variantValues');
      params.delete('variantName');
    }

    router.push(`/products?${params.toString()}`);
    onCloseAction?.();
  };

  const clearAll = () => {
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setInStock('');
    setMinRating('');
    setSelectedColors([]);
    setSelectedVariants({});
    router.push('/products');
    onCloseAction?.();
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const toggleVariant = (name: string, value: string) => {
    setSelectedVariants((prev) => {
      const current = prev[name] || [];
      return {
        ...prev,
        [name]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  // count active filters
  const activeCount = [
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    minRating,
    ...selectedColors,
    ...Object.values(selectedVariants).flat(),
  ].filter(Boolean).length;

  return (
    <div className="flex h-full flex-col">
      {/* ── header ──────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-700" />
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-xs font-medium text-red-500 hover:underline">
              Clear All
            </button>
          )}
          {onCloseAction && (
            <button onClick={onCloseAction} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── scrollable filter list ───────────────────── */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* ── CATEGORY ────────────────────────────────── */}
        {filters?.categories && (
          <FilterSection title="Category">
            <div className="space-y-1.5">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition hover:bg-gray-50 ${
                  !categoryId ? 'font-semibold text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setCategoryId('')}
              >
                <span>All Categories</span>
                <span className="text-xs text-gray-400">
                  {filters.categories.reduce((s, c) => s + c.count, 0)}
                </span>
              </label>
              {filters.categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition hover:bg-gray-50 ${
                    categoryId === String(cat.id)
                      ? 'font-semibold text-blue-600 bg-blue-50'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setCategoryId(categoryId === String(cat.id) ? '' : String(cat.id))}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-gray-400">{cat.count}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* ── PRICE RANGE ─────────────────────────────── */}
        <FilterSection title="Price Range">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-500">Min ($)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={String(filters?.priceRange.min || 0)}
                  min={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="mt-4 text-gray-400">—</span>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-500">Max ($)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={String(filters?.priceRange.max || 1000)}
                  min={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* quick price presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Under $25', min: '', max: '25' },
                { label: '$25–$50', min: '25', max: '50' },
                { label: '$50–$100', min: '50', max: '100' },
                { label: 'Over $100', min: '100', max: '' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setMinPrice(preset.min);
                    setMaxPrice(preset.max);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    minPrice === preset.min && maxPrice === preset.max
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* ── RATING ──────────────────────────────────── */}
        <FilterSection title="Minimum Rating">
          <div className="space-y-1.5">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-gray-50 ${
                  minRating === String(rating) ? 'bg-blue-50' : ''
                }`}
                onClick={() => setMinRating(minRating === String(rating) ? '' : String(rating))}
              >
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === String(rating)}
                  onChange={() => {}}
                  className="text-blue-600"
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500">& up</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* ── AVAILABILITY ────────────────────────────── */}
        <FilterSection title="Availability">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!inStock}
              onChange={(e) => setInStock(e.target.checked ? 'true' : '')}
              className="rounded text-blue-600"
            />
            In Stock Only
          </label>
        </FilterSection>

        {/* ── COLORS (if any products have color variants) */}
        {filters?.variants &&
          Object.entries(filters.variants).some(([, v]) => v.colors.length > 0) && (
            <FilterSection title="Color">
              <div className="flex flex-wrap gap-2">
                {Object.values(filters.variants)
                  .flatMap((v) => v.colors)
                  .filter((c, i, arr) => arr.indexOf(c) === i) // unique
                  .map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      title={color}
                      className={`relative h-8 w-8 rounded-full border-2 shadow-sm transition hover:scale-110 ${
                        selectedColors.includes(color)
                          ? 'border-gray-900 scale-110'
                          : 'border-white'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColors.includes(color) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="h-3.5 w-3.5"
                            style={{
                              color: isLightColor(color) ? '#000' : '#fff',
                            }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </FilterSection>
          )}

        {/* ── VARIANT GROUPS (Size, Material, etc.) ─────── */}
        {filters?.variants &&
          Object.entries(filters.variants)
            .filter(([name]) => name.toLowerCase() !== 'color')
            .map(([name, group]) => (
              <FilterSection key={name} title={name} defaultOpen={false}>
                <div className="flex flex-wrap gap-2">
                  {group.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => toggleVariant(name, value)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                        selectedVariants[name]?.includes(value)
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </FilterSection>
            ))}
      </div>

      {/* ── APPLY BUTTON ────────────────────────────────── */}
      <div className="mt-4 border-t pt-4">
        <button
          onClick={applyFilters}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Apply Filters
          {activeCount > 0 && ` (${activeCount})`}
        </button>
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  if (!hex) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
