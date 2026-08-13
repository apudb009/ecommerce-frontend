import ImageUpload from '@/components/ui/ImageUpload';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { VariantFormState } from '../form/ProductVariantForm';

type Props = {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
};

// ── VARIANT MODAL ────────────────────────────────────
function ProductVariantAddModal({ product, onClose, onSaved }: Props) {
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

export default ProductVariantAddModal;
