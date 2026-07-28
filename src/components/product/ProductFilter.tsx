'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import api from '@/lib/api';
import { SlidersHorizontal, X } from 'lucide-react';

export interface Filters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy: 'price' | 'createdAt' | 'name';
  sortOrder: 'asc' | 'desc';
}

export default function ProductFilter({
  filters,
  onChange,
  isCategory = false,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  isCategory?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMobile, setShowMobile] = useState(false);
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '');

  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  const applyPriceFilter = () => {
    onChange({
      ...filters,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    onChange({ sortBy: 'createdAt', sortOrder: 'desc' });
  };

  const hasActiveFilters =
    filters.categoryId || filters.minPrice || filters.maxPrice || filters.inStock;

  const FilterContent = (
    <div className="space-y-6">
      {/* ── SORT ────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Sort By</h3>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [
              Filters['sortBy'],
              Filters['sortOrder'],
            ];
            onChange({ ...filters, sortBy, sortOrder });
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {/* ── CATEGORY ────────────────────────────────── */}
      {!isCategory && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Category</h3>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="category"
                checked={!filters.categoryId}
                onChange={() => onChange({ ...filters, categoryId: undefined })}
                className="text-blue-600"
              />
              All Categories
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="radio"
                  name="category"
                  checked={filters.categoryId === cat.id}
                  onChange={() => onChange({ ...filters, categoryId: cat.id })}
                  className="text-blue-600"
                />
                {cat.name}
                {cat._count && (
                  <span className="text-xs text-gray-400">({cat._count.products})</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── PRICE RANGE ─────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={applyPriceFilter}
          className="mt-2 w-full rounded-md bg-gray-100 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Apply
        </button>
      </div>

      {/* ── IN STOCK ────────────────────────────────── */}
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={(e) => onChange({ ...filters, inStock: e.target.checked || undefined })}
            className="rounded text-blue-600"
          />
          In Stock Only
        </label>
      </div>

      {/* ── CLEAR ───────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <X className="h-3.5 w-3.5" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────── */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 rounded-lg border bg-white p-4">{FilterContent}</div>
      </aside>

      {/* ── MOBILE FILTER BUTTON ────────────────────── */}
      <button
        onClick={() => setShowMobile(true)}
        className="mb-4 flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">!</span>
        )}
      </button>

      {/* ── MOBILE DRAWER ───────────────────────────── */}
      {showMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setShowMobile(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowMobile(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}
    </>
  );
}
