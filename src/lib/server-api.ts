const API_URL = process.env.NEXT_PUBLIC_API_URL; // same base URL, reused

interface FetchOptions {
  revalidate?: number; // seconds; omit for default caching
  tags?: string[];
}

export async function serverFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
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
