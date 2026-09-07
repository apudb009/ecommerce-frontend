import { Banner, Category, FlashSale, Product } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import HomeClient from '@/components/home/HomeClient';

async function getHomeData() {
  const [banners, hotProducts, bestSellers, categories, flashSales] = await Promise.all([
    serverFetch<Banner[]>('/banners', { tags: ['banners'], revalidate: 600 }).catch(() => []),
    serverFetch<Product[]>('/products/hot', { tags: ['products'], revalidate: 600 }).catch(
      () => [],
    ),
    serverFetch<Product[]>('/products/best-sellers', { tags: ['products'], revalidate: 600 }).catch(
      () => [],
    ),
    serverFetch<Category[]>('/categories', { tags: ['categories'], revalidate: 3600 }).catch(
      () => [],
    ),
    serverFetch<FlashSale[]>('/flash-sales/active', { revalidate: 30 }).catch(() => []), // shorter TTL — time-sensitive
  ]);
  return { banners, hotProducts, bestSellers, categories, flashSales };
}

export default async function HomePage() {
  const { banners, hotProducts, bestSellers, categories, flashSales } = await getHomeData();

  return (
    <HomeClient
      banners={banners}
      hotProducts={hotProducts}
      bestSellers={bestSellers}
      categories={categories}
      flashSales={flashSales}
    />
  );
}
