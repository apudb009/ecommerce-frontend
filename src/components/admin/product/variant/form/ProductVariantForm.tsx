import ImageUpload from '@/components/ui/ImageUpload';
import api from '@/lib/api';
import { Product, ProductVariant as Variant } from '@/lib/types';
import { FC, useState } from 'react';
import { toast } from 'sonner';

export type VariantFormState = {
  name: string;
  value: string;
  stock: number;
  price: string;
  sku: string;
  color: string;
  images: string[];
};

type Props = {
  variantFormData: VariantFormState;
  variantImages: string[];
  productName: string;
  variantEdit: number | null;
  onVariantFormClose: () => void;
  product?: Product;
  onVariantAddOrUpdate: (variant: Variant, type: 'add' | 'update') => void;
  onChangeFormData: (data: VariantFormState) => void;
  onVariantImagesChange: (images: string[]) => void;
};

const ProductVariantForm: FC<Props> = ({
  variantFormData,
  variantImages,
  productName,
  variantEdit,
  onVariantFormClose,
  product,
  onVariantAddOrUpdate,
  onChangeFormData,
  onVariantImagesChange,
}) => {
  //const [variantImages, setVariantImages] = useState<string[]>([]);
  const generateSku = async (): Promise<string> => {
    const response = await api.post('/products/variants/getSku', {
      productName,
      variantValues: [variantFormData.name, variantFormData.value],
    });

    return response.data;
  };

  const handleAddVariant = async () => {
    if (!product?.id) {
      toast.error('Save the product first before adding variants');
      return;
    }
    try {
      const { data } = await api.post(`/products/${product.id}/variants`, {
        ...variantFormData,
        stock: Number(variantFormData.stock),
        price: variantFormData.price ? Number(variantFormData.price) : undefined,
      });
      onVariantAddOrUpdate(data, 'add');
      onChangeFormData({
        name: '',
        value: '',
        stock: 0,
        price: '',
        sku: '',
        color: '',
        images: [],
      });
      onVariantFormClose();
      toast.success('Variant added');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add variant');
    }
  };

  const handleUpdateVariant = async () => {
    try {
      const { data } = await api.patch(`/products/variants/${variantEdit}`, {
        ...variantFormData,
        stock: Number(variantFormData.stock),
        price: variantFormData.price ? Number(variantFormData.price) : undefined,
      });
      onVariantAddOrUpdate(data, 'update');
      onChangeFormData({
        name: '',
        value: '',
        stock: 0,
        price: '',
        sku: '',
        color: '',
        images: [],
      });
      onVariantFormClose();
      toast.success('Variant updated');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update variant');
    }
  };

  return (
    <div className="rounded-md border bg-gray-50 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Name (e.g. Size, Color)"
          value={variantFormData.name}
          onChange={(e) => onChangeFormData({ ...variantFormData, name: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Value (e.g. Large, Red)"
          value={variantFormData.value}
          onChange={(e) => onChangeFormData({ ...variantFormData, value: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Stock"
          value={variantFormData.stock}
          onChange={(e) => onChangeFormData({ ...variantFormData, stock: Number(e.target.value) })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Price (optional)"
          value={variantFormData.price}
          onChange={(e) => onChangeFormData({ ...variantFormData, price: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-2 flex gap-2">
        <input
          placeholder="SKU"
          value={variantFormData.sku ?? ''}
          onChange={(e) => onChangeFormData({ ...variantFormData, sku: e.target.value })}
          className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />

        <button
          type="button"
          onClick={async () => {
            const sku = await generateSku();

            onChangeFormData({
              ...variantFormData,
              sku,
            });
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
              value={variantFormData.color || '#000000'}
              onChange={(e) => onChangeFormData({ ...variantFormData, color: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-0.5"
            />
            <input
              placeholder="#FF5733 or empty"
              value={variantFormData.color}
              onChange={(e) => onChangeFormData({ ...variantFormData, color: e.target.value })}
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Product Images</label>
          <ImageUpload
            images={variantImages}
            onChange={(images) => {
              onVariantImagesChange(images);
              onChangeFormData({
                ...variantFormData,
                images,
              });
            }}
            maxImages={5}
            folder="variants"
          />
        </div>
      </div>

      {/* preview */}
      {(variantFormData.color || variantFormData.value) && (
        <div className="flex items-center gap-2 rounded-md bg-white p-2 text-xs">
          <span className="text-gray-500">Preview:</span>
          {variantFormData.color && (
            <span
              className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
              style={{ backgroundColor: variantFormData.color }}
            />
          )}
          <span className="font-medium text-gray-700">{variantFormData.value}</span>
          {variantFormData.price && (
            <span className="text-blue-600">${Number(variantFormData.price).toFixed(2)}</span>
          )}
          <span className="text-gray-400">Stock: {variantFormData.stock}</span>
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
          onClick={onVariantFormClose}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProductVariantForm;
