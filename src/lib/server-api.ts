import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // same base URL, reused

interface FetchOptions {
  revalidate?: number; // seconds; omit for default caching
  tags?: string[];
}

export async function serverFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  console.log('[serverFetch]', {
    path,
    hasToken: !!token,
    tokenLength: token?.length,
  });

  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    headers,
    next: {
      revalidate: options.revalidate ?? 300, // default: 5 min
      tags: options.tags,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  return res.json();
}
