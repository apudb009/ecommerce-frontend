'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';

export default function ProductSlider({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <div>
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <Link href={viewAllHref} className="text-sm font-medium text-blue-600 hover:underline">
            View All
          </Link>
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="rounded-full border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="rounded-full border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product, index) => (
          // <SliderCard key={product.id} product={product} index={index} />
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            extraClasses="shrink-0 w-48"
          />
        ))}
      </div>
    </div>
  );
}
