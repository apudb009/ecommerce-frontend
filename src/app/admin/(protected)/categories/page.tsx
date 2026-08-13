'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Category } from '@/lib/types';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';
import DeleteModal from '@/components/ui/DeleteModal';
import CategoryModal from './modal/Category';

export default function AdminCategoriesPage() {
  const { permissions } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>();

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      await fetchCategories();
    };

    loadCategories();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setActiveCategory(undefined);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        {hasPermission(permissions, 'categories', 'create') && (
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        )}
      </div>

      {hasPermission(permissions, 'categories', 'read') ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-400">/{cat.slug}</p>
                  {cat._count && (
                    <p className="mt-1 text-xs text-gray-500">{cat._count.products} products</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {hasPermission(permissions, 'categories', 'update') && (
                    <button
                      onClick={() => {
                        setEditing(cat);
                        setShowModal(true);
                      }}
                      className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {hasPermission(permissions, 'categories', 'delete') && (
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <RestrictedAccess />
      )}

      {activeCategory && (
        <DeleteModal
          onClose={() => setActiveCategory(undefined)}
          isOpen={!!activeCategory}
          onConfirm={() => handleDelete(activeCategory.id)}
          title="Delete Category"
          text={`Are you sure you want to delete this category ${activeCategory.name}?`}
        />
      )}

      {showModal && (
        <CategoryModal
          category={editing}
          onClose={() => setShowModal(false)}
          onSaved={(cat) => {
            if (editing) {
              setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
            } else {
              setCategories((prev) => [...prev, cat]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
