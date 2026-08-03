'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Props {
  page: number;
  lastPage: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function AdminPagination({
  page,
  lastPage,
  total,
  limit,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onLimitChange,
}: Props) {
  // generate page numbers with ellipsis
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
    .reduce((acc: (number | '...')[], p, i, arr) => {
      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) {
        acc.push('...');
      }
      acc.push(p);
      return acc;
    }, []);

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t bg-white px-4 py-3">
      {/* left — rows info + per page */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-500">
          Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Rows:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded border border-gray-300 py-0.5 pl-1.5 pr-5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {LIMIT_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* right — page buttons */}
      <div className="flex items-center gap-1">
        {/* first page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* page numbers */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="px-1 text-xs text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-7 rounded px-1.5 py-0.5 text-xs font-medium ${
                page === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ),
        )}

        {/* next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* last page */}
        <button
          onClick={() => onPageChange(lastPage)}
          disabled={!hasNextPage}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
