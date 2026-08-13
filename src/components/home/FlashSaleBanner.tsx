'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { FlashSale } from '@/lib/types';
import Image from 'next/image';

function calcFlashPrice(price: number, type: string, value: number): number {
  if (type === 'PERCENTAGE') {
    return Number((price - (price * value) / 100).toFixed(2));
  }
  return Math.max(0, price - value);
}

export default function FlashSaleBanner({ sales }: { sales: FlashSale[] }) {
  const [currentSale, setCurrentSale] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [expired, setExpired] = useState<number[]>([]);

  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const router = useRouter();

  const activeSales = sales.filter((s) => !expired.includes(s.id));

  if (activeSales.length === 0) return null;

  const sale = activeSales[currentSale % activeSales.length];
  const products = sale.products;

  if (products.length === 0) return null;

  const saleProduct = products[currentProduct % products.length];
  const origPrice = Number(saleProduct.product.price);
  const flashPrice = calcFlashPrice(origPrice, sale.discountType, Number(sale.discountValue));
  const savePct = Math.round(((origPrice - flashPrice) / origPrice) * 100);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await api.post('/cart/items', {
        productId: saleProduct.product.id,
        quantity: 1,
      });
      await fetchCart();
      toast.success('Added to cart at flash price!');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div
      className="overflow-hidden rounded-xl text-white"
      style={{ backgroundColor: sale.bannerColor }}
    >
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
        {/* ── LEFT — SALE INFO ──────────────────────────── */}
        <div className="shrink-0 md:w-56">
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Flash Sale</span>
          </div>
          <h2 className="text-xl font-bold">{sale.name}</h2>
          {sale.description && <p className="mt-1 text-sm opacity-80">{sale.description}</p>}

          <div className="mt-3">
            <p className="mb-1 text-xs opacity-70">Ends in:</p>
            <CountdownTimer
              endTime={sale.endTime}
              size="md"
              onExpired={() => setExpired((prev) => [...prev, sale.id])}
            />
          </div>

          {/* discount badge */}
          <div className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
            {sale.discountType === 'PERCENTAGE'
              ? `${sale.discountValue}% OFF`
              : `$${sale.discountValue} OFF`}
          </div>
        </div>

        {/* ── DIVIDER ───────────────────────────────────── */}
        <div className="hidden w-px self-stretch bg-white/20 md:block" />

        {/* ── RIGHT — PRODUCT SLIDER ────────────────────── */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-70">
              {products.length} product{products.length > 1 ? 's' : ''} in this sale
            </p>

            {/* prev/next */}
            {products.length > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentProduct((p) => (p - 1 + products.length) % products.length)
                  }
                  className="rounded-full bg-white/20 p-1 hover:bg-white/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentProduct((p) => (p + 1) % products.length)}
                  className="rounded-full bg-white/20 p-1 hover:bg-white/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* product card */}
          <div className="mt-2 flex items-center gap-4 rounded-lg bg-white/10 p-3">
            {/* image */}
            <Link
              href={`/products/${saleProduct.product.slug}`}
              className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/20"
            >
              {saleProduct.product.images?.[0] && (
                <Image
                  src={saleProduct.product.images[0].url}
                  alt={saleProduct.product.name}
                  className="h-full w-full object-contain"
                  width={80}
                  height={80}
                />
              )}
            </Link>

            {/* info */}
            <div className="flex-1 min-w-0">
              <Link href={`/products/${saleProduct.product.slug}`}>
                <p className="line-clamp-2 font-semibold hover:underline">
                  {saleProduct.product.name}
                </p>
              </Link>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold">${flashPrice.toFixed(2)}</span>
                <span className="text-sm line-through opacity-60">${origPrice.toFixed(2)}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">
                  -{savePct}%
                </span>
              </div>

              {saleProduct.product.stock <= 10 && (
                <p className="mt-1 text-xs opacity-80">Only {saleProduct.product.stock} left!</p>
              )}
            </div>

            {/* add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={saleProduct.product.stock === 0}
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-bold hover:bg-white/90 disabled:opacity-50"
              style={{ color: sale.bannerColor }}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>

          {/* product dots */}
          {products.length > 1 && (
            <div className="mt-2 flex justify-center gap-1">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentProduct(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentProduct % products.length ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MULTIPLE SALES TABS ───────────────────────── */}
      {activeSales.length > 1 && (
        <div className="flex border-t border-white/20">
          {activeSales.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentSale(i);
                setCurrentProduct(0);
              }}
              className={`flex-1 py-2 text-xs font-medium transition ${
                i === currentSale % activeSales.length
                  ? 'bg-white/20'
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
