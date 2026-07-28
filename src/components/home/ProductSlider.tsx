'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

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
        {products.map((product) => (
          <SliderCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// ── SLIDER CARD ─────────────────────────────────────
function SliderCard({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [adding, setAdding] = useState(false);

  const productImage = product?.images?.find((image) => image.isMain);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setAdding(true);
    try {
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      await fetchCart();
      toast.success(`${product.name} added to cart`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group w-48 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
    >
      {/* image */}
      <div className="relative aspect-square bg-gray-100">
        {productImage?.url ? (
          <img
            src={productImage.url}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* details */}
      <div className="p-3">
        <p className="line-clamp-2 text-xs font-medium text-gray-900">{product.name}</p>

        {/* rating */}
        {(product as any).avgRating && (
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-400">{(product as any).avgRating}</span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="rounded-md bg-blue-600 p-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
