'use client';

import Link from 'next/link';
import { FlashSaleProduct, Product } from '@/lib/types';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const { fetchCart, cart } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [flashPrice, setFlashPrice] = useState<number | null>(null);

  const productImage = product?.images?.find((image) => image.isMain);

  console.log(settings.max_cart_items);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/wishlist/check/${product.id}`)
      .then(({ data }) => setInWishlist(data))
      .catch(() => {});
  }, [product.id, user]);

  useEffect(() => {
    // check if product is in any active flash sale
    api
      .get('/flash-sales/active')
      .then(({ data }) => {
        for (const sale of data) {
          const inSale = sale.products.some((p: FlashSaleProduct) => p.product.id === product.id);
          if (inSale) {
            const orig = Number(product.price);
            const value = Number(sale.discountValue);
            const price =
              sale.discountType === 'PERCENTAGE' ? orig - (orig * value) / 100 : orig - value;
            setFlashPrice(Number(price.toFixed(2)));
            break;
          }
        }
      })
      .catch(() => {});
  }, [product.id, product.price]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${product.id}`);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${product.id}`);
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?redirect=/products`);
      return;
    }

    //If has variant redirect to product page
    if (product.variants?.length) {
      router.push(`/products/${product.slug}`);
      return;
    }

    setAdding(true);
    try {
      const totalCartItem = cart?.totalItems ?? 0;
      if (totalCartItem >= Number(settings.max_cart_items ?? 0)) {
        toast.error(`You can only have ${settings.max_cart_items} items in your cart`);
        return;
      }
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      await fetchCart();
      toast.success(`${product.name} added to cart`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
    >
      {/* ── IMAGE ───────────────────────────────────── */}
      <div className="relative aspect-square bg-gray-100">
        {product.images?.[0] ? (
          <>
            <img
              src={productImage?.url}
              alt={product.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            {flashPrice !== null && (
              <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                🔥 SALE
              </div>
            )}
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow-md transition hover:scale-110"
            >
              <Heart
                className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── DETAILS ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-xs font-medium text-blue-600">{product.category.name}</span>
        )}

        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>

        {/* rating */}
        {product.averageRating !== null && (
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">
              {product.averageRating} ({product._count?.reviews || 0})
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            {flashPrice !== null ? (
              <div>
                <span className="text-lg font-bold text-red-600">${flashPrice.toFixed(2)}</span>
                <span className="ml-1 text-sm text-gray-400 line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
