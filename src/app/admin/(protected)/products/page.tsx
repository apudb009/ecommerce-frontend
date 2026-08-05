/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminTable } from '@/hooks/useAdminTable';
import AdminSearch from '@/components/admin/table/AdminSearch';
import SortableHeader from '@/components/admin/table/SortableHeader';
import AdminPagination from '@/components/admin/table/AdminPagination';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';

const STATUS_OPTIONS = [
  {
    key: 'All',
    value: '',
  },
  {
    key: 'Active',
    value: 'true',
  },
  {
    key: 'Inactive',
    value: 'false',
  },
];

export default function AdminProductsPage() {
  const {
    data: products,
    meta,
    loading,
    limit,
    search,
    sort,
    order,
    setFilter,
    setPage,
    setSearch,
    setSort,
    setLimit,
    refresh,
  } = useAdminTable<Product>({
    endpoint: '/products/admin/all',
    defaultSort: 'createdAt',
  });

  const { permissions } = useAuthStore();

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/products/${id}`);
      refresh();
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {meta && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
              {meta.total}
            </span>
          )}
        </div>
        {hasPermission(permissions, 'products', 'create') && (
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        )}
      </div>

      {/* ── TOOLBAR ─────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* search */}
        <AdminSearch
          value={search}
          onChangeAction={setSearch}
          placeholder="Search for products..."
        />

        {/* status filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_OPTIONS.map((status, index) => (
            <button
              key={index}
              onClick={() => setFilter('status', status.value || null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                (new URLSearchParams(window?.location?.search || '').get('status') || '') ===
                status.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.key || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <SortableHeader
                label="Products"
                field="name"
                currentSort={sort}
                currentOrder={order}
                onSortAction={setSort}
                className="px-4 py-3"
              />
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const productImage = product?.images?.find((image) => image.isMain);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {productImage ? (
                          <img
                            src={productImage.url}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-100" />
                        )}
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.category?.name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stock === 0 ? 'text-red-600' : 'text-gray-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {hasPermission(permissions, 'products', 'update') && (
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        )}
                        {hasPermission(permissions, 'products', 'delete') && (
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {/* ── PAGINATION ───────────────────────────── */}
        {meta && (
          <AdminPagination
            page={meta.page}
            lastPage={meta.lastPage}
            total={meta.total}
            limit={limit}
            hasNextPage={meta.hasNextPage}
            hasPrevPage={meta.hasPrevPage}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>
    </div>
  );
}
