'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Product, PaginatedResponse, CategoryWithPaginatedResponse } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilter, { Filters } from '@/components/product/ProductFilter';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

type Props = {
  slug: string;
};

export default function Category({ slug }: Props) {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<Product>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // ── FETCH PRODUCTS ──────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<CategoryWithPaginatedResponse>('/categories/' + slug, {
          params: {
            page,
            limit: 12,
            search: search || undefined,
            ...filters,
          },
        });
        setProducts(data.products.data);
        setMeta(data.products.meta);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, page, search, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ── HEADER ──────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        {search && (
          <p className="mt-1 text-sm text-gray-500">Showing results for &ldquo;{search}&rdquo;</p>
        )}
      </div>

      {/* ── MOBILE SEARCH ───────────────────────────── */}
      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2 lg:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      <div className="flex gap-6">
        {/* ── FILTERS ───────────────────────────────── */}
        <ProductFilter
          filters={filters}
          onChange={(filter) => {
            setPage(1);
            setFilters(filter);
          }}
          isCategory
        />

        {/* ── PRODUCTS ──────────────────────────────── */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : (
            <>
              <ProductGrid products={products} />

              {/* ── PAGINATION ────────────────────────── */}
              {meta && meta.lastPage > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={!meta.hasPrevPage}
                    className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>

                  <span className="px-4 text-sm text-gray-600">
                    Page {meta.page} of {meta.lastPage}
                  </span>

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                    className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
