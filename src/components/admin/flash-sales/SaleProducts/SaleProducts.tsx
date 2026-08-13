import api from '@/lib/api';
import { FlashSale, Product } from '@/lib/types';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  saleId: number;
  existingProductIds: number[];
  onAdded: (sale: FlashSale) => void;
};

// ── ADD PRODUCTS TO SALE ────────────────────────────
function AddProductsToSale({ saleId, existingProductIds, onAdded }: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    try {
      const { data } = await api.get('/products', { params: { search: q, limit: 5 } });
      setResults(data.data.filter((p: Product) => !existingProductIds.includes(p.id)));
    } catch {
      // silent
    }
  };

  const handleAdd = async (productId: number) => {
    setLoading(true);
    try {
      const { data } = await api.post(`/flash-sales/${saleId}/products`, {
        productIds: [productId],
      });
      onAdded(data);
      setSearch('');
      setResults([]);
      toast.success('Product added to sale');
    } catch {
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t px-4 py-3">
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Products to Sale
        </button>
      ) : (
        <div className="relative">
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products to add..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {results.length > 0 && (
            <div className="left-0 right-0 top-full z-10 mt-1 rounded-md border bg-white shadow-lg">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAdd(p.id)}
                  disabled={loading}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {p.images?.[0] && (
                    <Image
                      src={p.images[0].url}
                      alt=""
                      className="h-8 w-8 rounded object-contain"
                      width={32}
                      height={32}
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">${Number(p.price).toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              setShow(false);
              setSearch('');
              setResults([]);
            }}
            className="mt-1 text-xs text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default AddProductsToSale;
