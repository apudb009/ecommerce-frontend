'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import ProductForm from '@/components/admin/ProductForm';
import { toast } from 'sonner';

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // note: fetch by id requires a backend endpoint;
        // your current API only has findBySlug publicly
        // simplest fix: add GET /products/admin/:id (see note below)
        const { data } = await api.get(`/products/admin/${id}`);
        setProduct(data);
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
