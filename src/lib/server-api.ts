import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setCookie } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // same base URL, reused

interface FetchOptions {
  revalidate?: number; // seconds; omit for default caching
  tags?: string[];
  loginPath?: '/login' | '/admin/login';
}

export async function serverFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

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

  if (res.status === 401) {
    // Try first to refresh token
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (refreshToken) {
      const refreshResponse: Response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!refreshResponse.ok) {
        console.error('Failed to refresh token');
        const loginPath =
          options.loginPath ?? (path.includes('/admin') ? '/admin/login' : '/login');
        redirect(loginPath);
      }

      const refreshData = await refreshResponse.json();

      if (refreshData) {
        // save new tokens
        setCookie('access_token', refreshData.access_token, 15 * 60);
        setCookie('refresh_token', refreshData.refresh_token ?? refreshToken, 7 * 24 * 60 * 60);

        // retry original request
        return serverFetch(path, options);
      }
    }
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  return res.json();
}
