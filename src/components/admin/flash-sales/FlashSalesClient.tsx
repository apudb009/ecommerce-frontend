'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Zap, X } from 'lucide-react';
import { format } from 'date-fns';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { FlashSale, FlashSaleProduct, Product } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import Image from 'next/image';
import DeleteModal from '@/components/ui/DeleteModal';
import AddProductsToSale from './SaleProducts';
import FlashSaleModal from './modal/sale';

export default function FlashSalesClient() {
  const { permissions } = useAuthStore();
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [activeSale, setActiveSale] = useState<FlashSale>();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await api.get('/flash-sales');
        setSales(data);
      } catch {
        toast.error('Failed to load flash sales');
      } finally {
        setLoading(false);
      }
    };
    void fetchSales();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/flash-sales/${id}`);
      setSales((prev) => prev.filter((s) => s.id !== id));
      toast.success('Flash sale deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActiveSale(undefined);
    }
  };

  const getSaleStatus = (sale: FlashSale) => {
    const now = new Date();
    const start = new Date(sale.startTime);
    const end = new Date(sale.endTime);

    if (!sale.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-500' };
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Ended', color: 'bg-red-100 text-red-700' };
    return { label: 'Live 🔥', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Flash Sales</h1>
        </div>
        {hasPermission(permissions, 'flash-sales', 'create') && (
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            New Flash Sale
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-center">
            <Zap className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">No flash sales yet</p>
          </div>
        ) : (
          sales.map((sale) => {
            const status = getSaleStatus(sale);
            const isLive = status.label === 'Live 🔥';
            return (
              <div
                key={sale.id}
                className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                  isLive ? 'border-orange-200' : ''
                }`}
              >
                {/* header */}
                <div
                  className="flex items-center justify-between p-4"
                  style={isLive ? { backgroundColor: `${sale.bannerColor}15` } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: sale.bannerColor }}
                    >
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{sale.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                          {sale.discountType === 'PERCENTAGE'
                            ? `${sale.discountValue}% OFF`
                            : `$${sale.discountValue} OFF`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {format(new Date(sale.startTime), 'MMM d, h:mm a')} →{' '}
                        {format(new Date(sale.endTime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLive && (
                      <div className="text-orange-600">
                        <CountdownTimer endTime={sale.endTime} size="sm" />
                      </div>
                    )}
                    {hasPermission(permissions, 'flash-sales', 'update') && (
                      <button
                        onClick={() => {
                          setEditing(sale);
                          setShowModal(true);
                        }}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {hasPermission(permissions, 'flash-sales', 'delete') && (
                      <button
                        onClick={() => setActiveSale(sale)}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* products */}
                {sale.products.length > 0 && (
                  <div className="border-t px-4 py-3">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      {sale.products.length} product{sale.products.length > 1 ? 's' : ''} in sale
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {sale.products.map((sp: FlashSaleProduct) => (
                        <div
                          key={sp.product.id}
                          className="flex shrink-0 items-center gap-2 rounded-md border bg-gray-50 px-2 py-1.5"
                        >
                          {sp.product.images?.[0] && (
                            <Image
                              src={sp.product.images[0]?.url}
                              alt=""
                              className="h-8 w-8 rounded object-contain"
                              width={32}
                              height={32}
                            />
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-800">{sp.product.name}</p>
                            <p className="text-xs text-gray-400">
                              ${Number(sp.product.price).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await api.delete(
                                  `/flash-sales/${sale.id}/products/${sp.product.id}`,
                                );
                                setSales((prev) =>
                                  prev.map((s) =>
                                    s.id === sale.id
                                      ? {
                                          ...s,
                                          products: s.products.filter(
                                            (p: FlashSaleProduct) => p.product.id !== sp.product.id,
                                          ),
                                        }
                                      : s,
                                  ),
                                );
                                toast.success('Product removed from sale');
                              } catch {
                                toast.error('Failed to remove product');
                              }
                            }}
                            className="ml-1 text-gray-300 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* add products */}
                <AddProductsToSale
                  saleId={sale.id}
                  existingProductIds={sale.products.map((p: FlashSaleProduct) => p.product.id)}
                  onAdded={(updated) =>
                    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                  }
                />
              </div>
            );
          })
        )}
      </div>

      {activeSale && (
        <DeleteModal
          isOpen={!!activeSale}
          title="Delete Flash Sale"
          text="Are you sure you want to delete this flash sale?"
          loading={loading}
          onClose={() => setActiveSale(undefined)}
          onConfirm={() => handleDelete(activeSale.id)}
        />
      )}

      {showModal && (
        <FlashSaleModal
          sale={editing}
          onClose={() => setShowModal(false)}
          onSaved={(saved) => {
            if (editing) {
              setSales((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
            } else {
              setSales((prev) => [saved, ...prev]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
