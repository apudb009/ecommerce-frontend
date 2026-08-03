'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminSearch({
  value,
  onChangeAction,
  placeholder = 'Search...',
}: {
  value: string;
  onChangeAction: (v: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 400);

  useEffect(() => {
    if (debounced !== value) onChangeAction(debounced);
  }, [debounced]); // eslint-disable-line

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-lg border border-gray-300 bg-white pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {local && (
        <button
          onClick={() => {
            setLocal('');
            onChangeAction('');
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
