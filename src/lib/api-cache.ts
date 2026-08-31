// Helper for server-side cached fetches

import { serverFetch } from './server-api';
import { Banner, Category, FlashSale, PaginatedResponse, Product, StoreSettings } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

export async function fetchCategories() {
  const categories = await serverFetch<Category[]>('/categories', {
    tags: ['categories'],
    revalidate: 3600,
  }).catch(() => []);

  return categories;
}

export async function fetchSettings() {
  const settings = await serverFetch<StoreSettings[]>('/settings', {
    revalidate: 600,
    tags: ['settings'],
  }).catch(() => []);
  return settings;
}

export async function fetchBanners() {
  const banners = await serverFetch<Banner[]>('/banners', {
    revalidate: 600,
    tags: ['banners'],
  }).catch(() => []);
  return banners;
}

export async function fetchFlashSales() {
  const flashSales = await serverFetch<FlashSale[]>('/flash-sales/active', {
    revalidate: 30,
    tags: ['flash-sales'],
  }).catch(() => []);
  return flashSales;
}

export async function fetchProducts(params: Record<string, string | undefined> = {}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();

  const products = await serverFetch<PaginatedResponse<Product>>(`/products?${query}`, {
    revalidate: 30,
    tags: ['products'],
  }).catch(() => ({ data: [], meta: null }));

  return products;
}
