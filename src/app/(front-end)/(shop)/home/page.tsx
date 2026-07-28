'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Banner, FlashSale, Product } from '@/lib/types';
import BannerSlider from '@/components/home/BannerSlider';
import ProductSlider from '@/components/home/ProductSlider';
import { Tag, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import FlashSaleBanner from '@/components/home/FlashSaleBanner';

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  _count: { products: number };
}

type NewsletterInput = {
  email: string;
};

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);

  const { register, handleSubmit, reset } = useForm<NewsletterInput>();

  const onSubmit = (data: NewsletterInput) => {
    api
      .post('/newsletters', { email: data.email })
      .then(() => {
        toast.success('Subscribed!');
        reset();
      })
      .catch((error) => {
        const message = error.response?.data?.message ?? 'Failed to subscribe';
        toast.error(message);
      });
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bannersRes, hotRes, bestRes, catsRes, flashRes] = await Promise.all([
          api.get<Banner[]>('/banners'),
          api.get<Product[]>('/products/hot'),
          api.get<Product[]>('/products/best-sellers'),
          api.get<Category[]>('/categories'),
          api.get('/flash-sales/active'),
        ]);

        setBanners(bannersRes.data);
        setHotProducts(hotRes.data);
        setBestSellers(bestRes.data);
        setCategories(catsRes.data);
        setFlashSales(flashRes.data);
      } catch {
        // silent fail — page still renders without data
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* banner skeleton */}
        <div className="aspect-21/9 animate-pulse rounded-xl bg-gray-100" />
        {/* categories skeleton */}
        <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
        {/* sliders skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-60 w-48 shrink-0 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      {/* ── BANNER SLIDER ─────────────────────────────── */}
      {banners.length > 0 && <BannerSlider banners={banners} />}

      {/* ── FALLBACK HERO (if no banners) ─────────────── */}
      {banners.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-linear-to-r from-blue-600 to-blue-400 py-16 text-center text-white">
          <h1 className="text-3xl font-bold md:text-4xl">Welcome to ShopApp</h1>
          <p className="mt-2 text-blue-100">Discover amazing products at great prices</p>
          <Link
            href="/products"
            className="mt-6 rounded-md bg-white px-8 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Shop Now
          </Link>
        </div>
      )}

      {flashSales.length > 0 && <FlashSaleBanner sales={flashSales} />}

      {/* ── CATEGORY QUICK LINKS ──────────────────────── */}
      {categories.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center rounded-lg border bg-white p-3 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-50">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <Tag className="h-6 w-6 text-blue-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400">{cat._count.products}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── HOT PRODUCTS SLIDER ───────────────────────── */}
      {hotProducts.length > 0 && (
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-medium text-orange-500">New Arrivals</span>
          </div>
          <ProductSlider
            title="🔥 Hot Products"
            products={hotProducts}
            viewAllHref="/products?sortBy=createdAt&sortOrder=desc"
          />
        </div>
      )}

      {/* ── PROMOTIONAL BANNER ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-linear-to-br from-purple-500 to-purple-700 p-6 text-white">
          <p className="text-sm font-medium text-purple-200">Free Shipping</p>
          <h3 className="mt-1 text-xl font-bold">Orders over $50</h3>
          <Link
            href="/products"
            className="mt-3 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
          >
            Shop Now
          </Link>
        </div>
        <div className="rounded-xl bg-linear-to-br from-orange-500 to-red-500 p-6 text-white">
          <p className="text-sm font-medium text-orange-200">Special Offer</p>
          <h3 className="mt-1 text-xl font-bold">New Arrivals Daily</h3>
          <Link
            href="/products?sortBy=createdAt&sortOrder=desc"
            className="mt-3 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
          >
            Explore
          </Link>
        </div>
      </div>

      {/* ── BEST SELLERS SLIDER ───────────────────────── */}
      {bestSellers.length > 0 && (
        <div>
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-xs font-medium text-green-500">Top Picks</span>
          </div>
          <ProductSlider title="🏆 Best Sellers" products={bestSellers} viewAllHref="/products" />
        </div>
      )}

      {/* ── NEWSLETTER SECTION ────────────────────────── */}
      <div className="rounded-xl bg-gray-900 px-6 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">Stay Updated</h2>
        <p className="mt-1 text-gray-400">Subscribe for exclusive deals and new arrivals</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mx-auto mt-4 md:flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email', { required: true })}
            />
            <button className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold hover:bg-blue-700 max-md:mt-4 max-md:w-full">
              Subscribe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
