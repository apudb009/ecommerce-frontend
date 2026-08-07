'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Category, Product, ProductVariant } from '@/lib/types';
import { toast } from 'sonner';
import ImageUpload from '../ui/ImageUpload';
import { Trash2, Edit2, FileExclamationPoint } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';

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
  const [variants, setVariants] = useState<ProductVariant[]>([]);
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

  const generateSku = async (): Promise<string> => {
    const response = await api.post('/products/variants/getSku', {
      productName: form.name,
      variantValues: [newVariant.name, newVariant.value],
    });

    return response.data;
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

  const handleAddVariant = async () => {
    if (!product?.id) {
      toast.error('Save the product first before adding variants');
      return;
    }
    try {
      const { data } = await api.post(`/products/${product.id}/variants`, {
        ...newVariant,
        stock: Number(newVariant.stock),
        price: newVariant.price ? Number(newVariant.price) : undefined,
      });
      setVariants((prev) => [...prev, data]);
      setNewVariant({ name: '', value: '', stock: 0, price: '', sku: '', color: '', images: [] });
      setShowVariantForm(false);
      toast.success('Variant added');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add variant');
    }
  };

  const handleUpdateVariant = async () => {
    try {
      const { data } = await api.patch(`/products/variants/${variantEdit}`, {
        ...newVariant,
        stock: Number(newVariant.stock),
        price: newVariant.price ? Number(newVariant.price) : undefined,
      });
      setVariants((prev) => prev.map((v) => (v.id === data.id ? data : v)));
      setNewVariant({ name: '', value: '', stock: 0, price: '', sku: '', color: '', images: [] });
      setShowVariantForm(false);
      setVariantEdit(null);
      toast.success('Variant updated');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update variant');
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
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
    try {
      await api.delete(`/products/variants/${variantId}`);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      toast.success('Variant deleted');
    } catch {
      toast.error('Failed to delete variant');
    }
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
          <div className="rounded-md border bg-gray-50 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Name (e.g. Size, Color)"
                value={newVariant.name}
                onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Value (e.g. Large, Red)"
                value={newVariant.value}
                onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Stock"
                value={newVariant.stock}
                onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="Price (optional)"
                value={newVariant.price}
                onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <input
                placeholder="SKU"
                value={newVariant.sku ?? ''}
                onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />

              <button
                type="button"
                onClick={async () => {
                  const sku = await generateSku();

                  setNewVariant((prev) => ({
                    ...prev,
                    sku,
                  }));
                }}
                className="rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-100"
              >
                Generate
              </button>
            </div>

            {/* ── COLOR SWATCH ──────────────────────────── */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Color Swatch (for Color variants)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newVariant.color || '#000000'}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-0.5"
                  />
                  <input
                    placeholder="#FF5733 or empty"
                    value={newVariant.color}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Variant Images (optional)
              </label>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <ImageUpload
                  images={variantImages}
                  onChange={(images) => {
                    setVariantImages(images);
                    setNewVariant((prev) => ({
                      ...prev,
                      images,
                    }));
                  }}
                  maxImages={5}
                  folder="variants"
                />
              </div>
            </div>

            {/* preview */}
            {(newVariant.color || newVariant.value) && (
              <div className="flex items-center gap-2 rounded-md bg-white p-2 text-xs">
                <span className="text-gray-500">Preview:</span>
                {newVariant.color && (
                  <span
                    className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: newVariant.color }}
                  />
                )}
                <span className="font-medium text-gray-700">{newVariant.value}</span>
                {newVariant.price && (
                  <span className="text-blue-600">${Number(newVariant.price).toFixed(2)}</span>
                )}
                <span className="text-gray-400">Stock: {newVariant.stock}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={variantEdit ? handleUpdateVariant : handleAddVariant}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                {variantEdit ? 'Update Variant' : 'Add Variant'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVariantForm(false);
                  if (variantEdit) {
                    setVariantEdit(null);
                  }
                }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {variants.map((v) => {
          const selected = v.id === variantEdit;
          return (
            <div
              key={v.id}
              className={`flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2 text-sm ${
                selected ? 'hidden' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {v.color && (
                  <span
                    className="h-4 w-4 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: v.color }}
                  />
                )}
                <span className="text-gray-700">
                  <strong>{v.name}:</strong> {v.value}
                  {v.price && (
                    <span className="ml-2 text-blue-600">${Number(v.price).toFixed(2)}</span>
                  )}
                  <span className="ml-2 text-gray-400">Stock: {v.stock}</span>
                  {v.sku && <span className="ml-2 text-gray-300">SKU: {v.sku}</span>}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditVariant(v)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVariant(v.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

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

// ── VARIANT MODAL ────────────────────────────────────
function ProductVariantAddModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const [newVariant, setNewVariant] = useState<VariantFormState>({
    name: '',
    value: '',
    stock: 0,
    price: '',
    sku: '',
    color: '',
    images: [],
  });
  const [loading, setLoading] = useState(false);

  const generateSku = async (): Promise<string> => {
    const response = await api.post('/products/variants/getSku', {
      productName: product.name,
      variantValues: [newVariant.name, newVariant.value],
    });

    return response.data;
  };

  const addVariant = async () => {
    setLoading(true);
    try {
      await api.post(`/products/${product.id}/variants`, {
        ...newVariant,
        stock: Number(newVariant.stock),
        price: newVariant.price ? Number(newVariant.price) : undefined,
      });

      setNewVariant({ name: '', value: '', stock: 0, price: '', sku: '', color: '', images: [] });
      toast.success('Variant added');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Add Variant</h2>

        <div className="rounded-md border bg-gray-50 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Name (e.g. Size, Color)"
              value={newVariant.name}
              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="Value (e.g. Large, Red)"
              value={newVariant.value}
              onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Stock"
              value={newVariant.stock}
              onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="Price (optional)"
              value={newVariant.price}
              onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <input
              placeholder="SKU"
              value={newVariant.sku ?? ''}
              onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />

            <button
              type="button"
              onClick={async () => {
                const sku = await generateSku();
                console.log(sku);
                setNewVariant((prev) => ({
                  ...prev,
                  sku,
                }));
              }}
              className="rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-100"
            >
              Generate
            </button>
          </div>

          {/* ── COLOR SWATCH ──────────────────────────── */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Color Swatch (for Color variants)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newVariant.color || '#000000'}
                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-0.5"
                />
                <input
                  placeholder="#FF5733 or empty"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Variant Images (optional)
              </label>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <ImageUpload
                  images={variantImages}
                  onChange={(images) => {
                    setVariantImages(images);
                    setNewVariant((prev) => ({
                      ...prev,
                      images,
                    }));
                  }}
                  maxImages={5}
                  folder="variants"
                />
              </div>
            </div>
          </div>

          {/* preview */}
          {(newVariant.color || newVariant.value) && (
            <div className="flex items-center gap-2 rounded-md bg-white p-2 text-xs">
              <span className="text-gray-500">Preview:</span>
              {newVariant.color && (
                <span
                  className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: newVariant.color }}
                />
              )}
              <span className="font-medium text-gray-700">{newVariant.value}</span>
              {newVariant.price && (
                <span className="text-blue-600">${Number(newVariant.price).toFixed(2)}</span>
              )}
              <span className="text-gray-400">Stock: {newVariant.stock}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addVariant}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              {loading ? 'Adding...' : 'Add Variant'}
            </button>
            <button
              type="button"
              onClick={() => onClose()}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSaved()}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
            >
              Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
