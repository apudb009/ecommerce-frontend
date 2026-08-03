'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function SortableHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSortAction,
  className = '',
}: {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSortAction: (field: string) => void;
  className?: string;
}) {
  const isActive = currentSort === field;

  return (
    <th className={`px-4 py-3 ${className}`} onClick={() => onSortAction(field)}>
      <button className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-gray-700">
        {label}
        {isActive ? (
          currentOrder === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />
        )}
      </button>
    </th>
  );
}
