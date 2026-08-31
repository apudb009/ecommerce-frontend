'use client';

import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const clientCache = new Map<string, CacheEntry<unknown>>();

export function useCache<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 60) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetch = async () => {
      const cached = clientCache.get(key);

      if (cached && Date.now() - cached.fetchedAt < ttlSeconds * 1000) {
        setData(cached.data as T);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = await fetcher();

        clientCache.set(key, {
          data: result,
          fetchedAt: Date.now(),
        });

        if (mountedRef.current) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    void fetch();

    return () => {
      mountedRef.current = false;
    };
  }, [key, fetcher, ttlSeconds]);

  const invalidate = () => {
    clientCache.delete(key);
  };

  const refetch = async () => {
    clientCache.delete(key);
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      clientCache.set(key, {
        data: result,
        fetchedAt: Date.now(),
      });

      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    invalidate,
    refetch,
  };
}

export function invalidateClientCache(prefix: string) {
  for (const key of clientCache.keys()) {
    if (key.startsWith(prefix)) {
      clientCache.delete(key);
    }
  }
}
