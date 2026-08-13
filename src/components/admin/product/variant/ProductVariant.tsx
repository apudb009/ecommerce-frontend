import { FC } from 'react';
import { ProductVariant as Variant } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

type Props = {
  variants: Variant[];
  onVariantEdit: (data: Variant) => void;
  onVariantDelete: (variantId: number) => void;
  variantForEdit: number | null;
};

const ProductVariant: FC<Props> = ({
  variants,
  onVariantEdit,
  variantForEdit,
  onVariantDelete,
}) => {
  const handleEditVariant = (variant: Variant) => {
    onVariantEdit(variant);
  };

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await api.delete(`/products/variants/${variantId}`);
      onVariantDelete(variantId);
      toast.success('Variant deleted');
    } catch {
      toast.error('Failed to delete variant');
    }
  };

  return (
    <>
      {variants.map((v) => {
        const selected = v.id === variantForEdit;
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
    </>
  );
};

export default ProductVariant;
