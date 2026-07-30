'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Search, X, Loader2, TrendingUp } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';
import { Product } from '@/lib/types';

// interface SearchResult {
//   id: number;
//   name: string;
//   slug: string;
//   price: string;
//   images: string[];
//   category: { name: string };
// }

const POPULAR_SEARCHES = ['iPhone', 'Nike', 'Samsung', 'Laptop', 'Headphones'];

export default function SearchBar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  // ── fetch suggestions ──────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products', {
          params: { search: debouncedQuery, limit: 6 },
        });
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    void search();
  }, [debouncedQuery]);

  // ── keyboard navigation ────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focused) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected >= 0 && results[selected]) {
        router.push(`/products/${results[selected].slug}`);
        setFocused(false);
        setQuery('');
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  // ── submit search ──────────────────────────────────
  const handleSearch = () => {
    if (!query.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', query.trim());
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
    setFocused(false);
  };

  // ── clear search ───────────────────────────────────
  const handleClear = () => {
    setQuery('');
    setResults([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/products?${params.toString()}`);
    inputRef.current?.focus();
  };

  // ── close on outside click ─────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sizeClass = {
    sm: 'h-9  text-sm',
    md: 'h-11 text-sm',
    lg: 'h-12 text-base',
  }[size];

  const showDropdown = focused && (query.length >= 2 ? results.length > 0 || loading : true); // show popular searches when empty

  return (
    <div className="relative w-full">
      {/* ── INPUT ───────────────────────────────────── */}
      <div
        className={`flex items-center rounded-xl border bg-white shadow-sm transition ${
          focused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'
        }`}
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const { value } = e.target;
            setQuery(value);
            setSelected(-1);

            if (value.length < 2) {
              setResults([]);
            }
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, categories..."
          className={`flex-1 bg-transparent px-3 focus:outline-none ${sizeClass}`}
        />

        {/* loading / clear */}
        {loading ? (
          <Loader2 className="mr-3 h-4 w-4 animate-spin text-gray-400" />
        ) : query ? (
          <button onClick={handleClear} className="mr-2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {/* search button */}
        <button
          onClick={handleSearch}
          className="mr-1 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* ── DROPDOWN ────────────────────────────────── */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border bg-white shadow-xl"
        >
          {/* popular searches (when no query) */}
          {query.length < 2 && (
            <div className="p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <TrendingUp className="h-3.5 w-3.5" />
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      handleSearch();
                    }}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* results */}
          {query.length >= 2 && loading && (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found for &quot;{query}&quot;
            </div>
          )}

          {query.length >= 2 && !loading && results.length > 0 && (
            <>
              <div className="px-3 pt-3 text-xs font-semibold text-gray-400">Products</div>
              {results.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => {
                    setFocused(false);
                    setQuery('');
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 transition ${
                    selected === i ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* thumbnail */}
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]?.url}
                        alt=""
                        className="h-full w-full object-cover"
                        width={8}
                        height={8}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {highlightMatch(product.name, query)}
                    </p>
                    <p className="text-xs text-gray-400">{product?.category?.name}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </Link>
              ))}

              {/* view all */}
              <div className="border-t p-2">
                <button
                  onClick={handleSearch}
                  className="w-full rounded-lg py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  View all results for &quot;{query}&quot; →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// highlight matching text
function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-gray-900">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
