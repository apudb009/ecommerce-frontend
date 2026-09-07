import api from '@/lib/api';
import { Category } from '@/lib/types';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  category: Category | null;
  onClose: () => void;
  onSaved: (cat: Category) => void;
};

type FormErrors = Partial<Record<'name' | 'slug' | 'description', string>>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ── CATEGORY MODAL ──────────────────────────────────
function CategoryModal({ category, onClose, onSaved }: Props) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNameChange = (value: string) => {
    setName(value);
    clearError('name');
    if (!isEdit) {
      setSlug(
        value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
      );
      clearError('slug');
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      next.name = 'Name is required';
    } else if (trimmedName.length < 2) {
      next.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 60) {
      next.name = 'Name must be under 60 characters';
    }

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      next.slug = 'Slug is required';
    } else if (!SLUG_PATTERN.test(trimmedSlug)) {
      next.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    }

    if (description.trim().length > 500) {
      next.description = 'Description must be under 500 characters';
    }

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      };
      const { data } = isEdit
        ? await api.patch(`/categories/${category.id}`, payload)
        : await api.post('/categories', payload);

      toast.success(isEdit ? 'Category updated' : 'Category created');
      onSaved(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const errorClass = (field: keyof FormErrors) =>
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Category' : 'New Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={errorClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                clearError('slug');
              }}
              className={errorClass('slug')}
            />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError('description');
              }}
              rows={3}
              className={errorClass('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;
