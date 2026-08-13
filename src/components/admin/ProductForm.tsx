'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Category, Product, ProductVariant as Variant } from '@/lib/types';
import { toast } from 'sonner';
import ImageUpload from '../ui/ImageUpload';
import { FileExclamationPoint } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import ProductVariantForm from './product/variant/form';
import ProductVariant from './product/variant';
import ProductVariantAddModal from './product/variant/modal';

type VariantFormState = {
  name: string;
  value: string;
  stock: number;
  price: string;
  sku: string;
  color: string;
  images: string[];
};

export default function ProductForm({ product }: { product?: Product }) {
  const { permissions } = useAuthStore();
  const router = useRouter();
  const isEdit = !!product;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Product | null>(null);

  // add state for variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState<VariantFormState>({
    name: '',
    value: '',
    stock: 0,
    price: '',
    sku: '',
    color: '',
    images: [],
  });

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    categoryId: product?.categoryId?.toString() || '',
    isActive: product?.isActive ?? true,
  });

  const productImages = product?.images.map((img) => img.url) || [];

  const [images, setImages] = useState<string[]>(productImages);
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const [variantEdit, setVariantEdit] = useState<number | null>(null);

  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleNameChange = (value: string) => {
    setForm((f) => ({
      ...f,
      name: value,
      slug: isEdit
        ? f.slug
        : value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: Number(form.categoryId),
      isActive: form.isActive,
      images,
    };

    try {
      if (isEdit) {
        await api.patch(`/products/${product.id}`, payload);
        toast.success('Product updated');
        router.push('/admin/products');
      } else {
        const response = await api.post('/products', payload);
        setNewProduct(response.data);
        toast.success('Product created');
        setShowModal(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // fetch existing variants if editing
  useEffect(() => {
    if (product?.id) {
      api
        .get(`/products/${product.id}/variants`)
        .then(({ data }) => setVariants(data))
        .catch(() => {});
    }
  }, [product?.id]);

  const handleEditVariant = (variant: Variant) => {
    setVariantImages(variant?.images?.map((img) => img.url) ?? []);
    setNewVariant({
      name: variant.name,
      value: variant.value,
      stock: variant.stock,
      price: variant.price?.toString() || '',
      sku: variant.sku ?? '',
      color: variant.color ?? '',
      images: variant?.images?.map((img) => img.url) ?? [],
    });
    setShowVariantForm(true);
    setVariantEdit(variant.id);
  };

  const handleDeleteVariant = async (variantId: number) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  if (
    !hasPermission(permissions, 'products', 'create') ||
    !hasPermission(permissions, 'products', 'update')
  ) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <FileExclamationPoint className="h-6 w-6 text-red-600" />
            <span className="text-lg font-semibold text-red-600">Access Denied</span>
          </div>
          <span className="text-gray-600">You don&apos;t have permission to access this page</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {/* name + slug */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* price + stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* images */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Product Images</label>
          <ImageUpload
            images={images}
            onChange={setImages}
            maxImages={5}
            folder="products"
            product={product}
          />
        </div>

        {product?.id && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Variants</label>
              <button
                type="button"
                onClick={() => setShowVariantForm((s) => !s)}
                className="text-xs text-blue-600 hover:underline"
              >
                + Add Variant
              </button>
            </div>
          </div>
        )}

        {showVariantForm && (
          <ProductVariantForm
            variantEdit={variantEdit}
            variantFormData={newVariant}
            variantImages={variantImages}
            onVariantImagesChange={setVariantImages}
            onChangeFormData={(newData) => setNewVariant(newData)}
            productName={form.name}
            onVariantFormClose={() => {
              setShowVariantForm(false);
              setVariantEdit(null);
            }}
            product={product}
            onVariantAddOrUpdate={(variant, type) => {
              if (type === 'add') {
                setVariants((prev) => [...prev, variant]);
              } else {
                setVariants((prev) => prev.map((v) => (v.id === variant.id ? variant : v)));
              }
            }}
          />
        )}

        <ProductVariant
          variants={variants}
          onVariantEdit={handleEditVariant}
          onVariantDelete={handleDeleteVariant}
          variantForEdit={variantEdit}
        />

        {/* active toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="rounded text-blue-600"
          />
          Active (visible in store)
        </label>

        {/* submit */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
      {showModal && newProduct && (
        <ProductVariantAddModal
          product={newProduct}
          onClose={() => {
            setShowModal(false);
            router.push('/admin/products');
          }}
          onSaved={() => {
            setShowModal(false);
            router.push('/admin/products');
          }}
        />
      )}
    </>
  );
}
