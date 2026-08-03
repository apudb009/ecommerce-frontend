'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

interface UseAdminTableOptions {
  endpoint: string;
  defaultLimit?: number;
  defaultSort?: string;
  defaultOrder?: 'asc' | 'desc';
}

export function useAdminTable<T>({
  endpoint,
  defaultLimit = 10,
  defaultSort = 'createdAt',
  defaultOrder = 'desc',
}: UseAdminTableOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // ── read from URL params ───────────────────────────
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || defaultLimit);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || defaultSort;
  const order = (searchParams.get('order') || defaultOrder) as 'asc' | 'desc';

  // ── build extra params from URL ────────────────────
  const getExtraParams = useCallback(() => {
    const extra: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'search', 'sort', 'order'].includes(key)) {
        extra[key] = value;
      }
    });
    return extra;
  }, [searchParams]);

  // ── fetch data ─────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(endpoint, {
        params: {
          page,
          limit,
          search: search || undefined,
          sortBy: sort,
          sortOrder: order,
          ...getExtraParams(),
        },
      });

      setData(res.data ?? res);
      setMeta(res.meta ?? null);
    } catch {
      setData([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search, sort, order, getExtraParams]);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    void loadData();
  }, [fetchData]);

  // ── update URL helpers ─────────────────────────────
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1'); // reset to page 1 on filter change
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const setPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const setSearch = useCallback(
    (q: string) => {
      updateParam('search', q || null);
    },
    [updateParam],
  );

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      updateParam(key, value);
    },
    [updateParam],
  );

  const setSort = useCallback(
    (field: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSort = params.get('sort') || defaultSort;
      const currentOrder = params.get('order') || defaultOrder;

      if (currentSort === field) {
        // toggle order
        params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
      } else {
        params.set('sort', field);
        params.set('order', 'desc');
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [searchParams, router, defaultSort, defaultOrder],
  );

  const setLimit = useCallback(
    (l: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', String(l));
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const refresh = useCallback(() => fetchData(), [fetchData]);

  return {
    data,
    meta,
    loading,
    page,
    limit,
    search,
    sort,
    order,
    setPage,
    setSearch,
    setFilter,
    setSort,
    setLimit,
    refresh,
  };
}
