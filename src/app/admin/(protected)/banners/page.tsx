'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';
import DeleteModal from '@/components/ui/DeleteModal';

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  position: number;
}

export default function AdminBannersPage() {
  const { permissions } = useAuthStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeBanner, setActiveBanner] = useState<Banner>();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banners/admin/all');
        setBanners(data);
      } catch {
        toast.error('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };
    void fetchBanners();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/banners/${id}`);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success('Banner deleted');
    } catch {
      toast.error('Failed to delete banner');
    } finally {
      setActiveBanner(undefined);
    }
  };

  const handleToggle = async (banner: Banner) => {
    try {
      const { data } = await api.patch(`/banners/${banner.id}`, {
        isActive: !banner.isActive,
      });
      setBanners((prev) => prev.map((b) => (b.id === data.id ? data : b)));
    } catch {
      toast.error('Failed to update banner');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        {hasPermission(permissions, 'banners', 'create') && (
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </button>
        )}
      </div>

      <div className="space-y-3">
        {hasPermission(permissions, 'banners', 'read') ? (
          banners.map((banner) => (
            <div key={banner.id} className="flex items-center gap-4 rounded-lg border bg-white p-4">
              <Image
                src={banner.image}
                alt={banner.title}
                className="h-16 w-28 rounded-md object-contain"
                width={112}
                height={64}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{banner.title}</p>
                {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
                <p className="text-xs text-gray-400">Position: {banner.position}</p>
              </div>
              <div className="flex items-center gap-2">
                {hasPermission(permissions, 'banners', 'update') && (
                  <button
                    onClick={() => handleToggle(banner)}
                    className={`rounded-md p-1.5 ${
                      banner.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={banner.isActive ? 'Active' : 'Inactive'}
                  >
                    {banner.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                )}
                {hasPermission(permissions, 'banners', 'update') && (
                  <button
                    onClick={() => {
                      setEditing(banner);
                      setShowForm(true);
                    }}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {hasPermission(permissions, 'banners', 'delete') && (
                  <button
                    onClick={() => setActiveBanner(banner)}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <RestrictedAccess />
        )}
      </div>

      {showForm && (
        <BannerModal
          banner={editing}
          onClose={() => setShowForm(false)}
          onSaved={(b) => {
            if (editing) {
              setBanners((prev) => prev.map((x) => (x.id === b.id ? b : x)));
            } else {
              setBanners((prev) => [...prev, b]);
            }
            setShowForm(false);
          }}
        />
      )}

      {activeBanner && (
        <DeleteModal
          isOpen={!!activeBanner}
          title="Delete Banner"
          text="Are you sure you want to delete this banner?"
          loading={loading}
          onClose={() => setActiveBanner(undefined)}
          onConfirm={() => handleDelete(activeBanner.id)}
        />
      )}
    </div>
  );
}

// ── BANNER MODAL ────────────────────────────────────
function BannerModal({
  banner,
  onClose,
  onSaved,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSaved: (b: Banner) => void;
}) {
  const isEdit = !!banner;
  const [form, setForm] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image: banner?.image || '',
    link: banner?.link || '',
    position: banner?.position ?? 0,
    isActive: banner?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        subtitle: form.subtitle || undefined,
        link: form.link || undefined,
      };
      const { data } = isEdit
        ? await api.patch(`/banners/${banner.id}`, payload)
        : await api.post('/banners', payload);
      toast.success(isEdit ? 'Banner updated' : 'Banner created');
      onSaved(data);
    } catch {
      toast.error('Failed to save banner');
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
        <h2 className="mb-4 text-lg font-semibold">{isEdit ? 'Edit Banner' : 'New Banner'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            placeholder="Subtitle (optional)"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Banner Image</label>
            <ImageUpload
              images={form.image ? [form.image] : []}
              onChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })}
              maxImages={1}
              folder="banners"
            />
          </div>
          {form.image && (
            <img src={form.image} alt="" className="h-24 w-full rounded-md object-cover" />
          )}
          <input
            placeholder="Link URL (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Position (0 = first)"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
