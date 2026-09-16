'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { PaginationMeta } from '@/lib/types';

interface UseTableOptions {
  endpoint: string;
  defaultLimit?: number;
  defaultSort?: string;
  defaultOrder?: 'asc' | 'desc';
  initialData?: unknown[];
  initialMeta?: PaginationMeta | null;
  initialQueryKey?: string;
}

export function useTable<T>({
  endpoint,
  defaultLimit = 10,
  defaultSort = 'createdAt',
  defaultOrder = 'desc',
  initialData,
  initialMeta = null,
  initialQueryKey,
}: UseTableOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<T[]>(() => (initialData as T[] | undefined) ?? []);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(!initialData);
  const skippedInitialQuery = useRef<string | null>(null);

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

  const queryKey = `${page}|${limit}|${search}|${sort}|${order}|${JSON.stringify(getExtraParams())}`;

  useEffect(() => {
    if (initialQueryKey === queryKey && skippedInitialQuery.current !== queryKey) {
      skippedInitialQuery.current = queryKey;
      return;
    }

    const loadData = async () => {
      await fetchData();
    };
    void loadData();
  }, [fetchData, initialQueryKey, queryKey]);

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
