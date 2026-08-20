'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PaginatedResponse, Product } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import SearchBar from '@/components/product/SearchBar';
import ActiveFilterTags from '@/components/product/ActiveFilterTags';
import { SlidersHorizontal, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low→High' },
  { value: 'price:desc', label: 'Price: High→Low' },
  { value: 'name:asc', label: 'Name: A→Z' },
  { value: 'name:desc', label: 'Name: Z→A' },
];

export default function ProductsClient({
  products,
  meta,
}: {
  products: Product[];
  meta: PaginatedResponse<Product>['meta'] | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const page = Number(searchParams.get('page') || 1);
  const sortParam = searchParams.get('sortBy')
    ? `${searchParams.get('sortBy')}:${searchParams.get('sortOrder') || 'desc'}`
    : 'createdAt:desc';

  const setSort = (value: string) => {
    const [sortBy, sortOrder] = value.split(':');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ── SEARCH BAR ────────────────────────────────── */}
      <div className="mb-6">
        <SearchBar size="lg" />
      </div>

      {/* ── ACTIVE FILTER TAGS ────────────────────────── */}
      <div className="mb-4">
        <ActiveFilterTags />
      </div>

      <div className="flex gap-6">
        {/* ── DESKTOP SIDEBAR ───────────────────────────── */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border bg-white p-4">
            <FilterSidebar />
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* toolbar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* mobile filter button */}
              <button
                onClick={() => setShowSidebar(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              {/* results count */}
              {meta && (
                <p className="text-sm text-gray-500">
                  <strong className="text-gray-900">{meta.total}</strong> products
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* sort */}
              <select
                value={sortParam}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* view mode */}
              <div className="hidden items-center rounded-lg border sm:flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-l-lg p-2 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-r-lg p-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* products */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">
              <p className="text-lg font-medium text-gray-700">No products found</p>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filters</p>
              <button
                onClick={() => router.push('/products')}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            // list view
            <div className="space-y-3">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-xl border bg-white p-4 shadow-sm hover:shadow-md mb-3"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]?.url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          width={96}
                          height={96}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category?.name}</p>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {product.description}
                        </p>
                      )}
                      {/* variant swatches in list view */}
                      {product.variants?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.variants.slice(0, 6).map((v) =>
                            v.color ? (
                              <span
                                key={v.id}
                                className="h-4 w-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: v.color }}
                                title={v.value}
                              />
                            ) : (
                              <span
                                key={v.id}
                                className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600"
                              >
                                {v.value}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </p>
                      {product.avgRating && (
                        <p className="text-xs text-yellow-500">★ {product.avgRating}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── PAGINATION ─────────────────────────────── */}
          {meta && meta.lastPage > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!meta.hasPrevPage}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              {/* page numbers */}
              {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.lastPage || Math.abs(p - page) <= 1)
                .reduce((acc: (number | string)[], p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium ${
                        page === p
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                onClick={() => setPage(page + 1)}
                disabled={!meta.hasNextPage}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ────────────────────────── */}
      {showSidebar && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowSidebar(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-2xl bg-white p-4 shadow-xl lg:hidden">
            <div className="mb-2 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            <div className="h-full overflow-y-auto">
              <FilterSidebar onCloseAction={() => setShowSidebar(false)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
