import Image from 'next/image';
import ImageUpload from '@/components/ui/ImageUpload';
import api from '@/lib/api';
import { Banner } from '@/lib/types';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  banner: Banner | null;
  onClose: () => void;
  onSaved: (b: Banner) => void;
};

// ── BANNER MODAL ────────────────────────────────────

function BannerModal({ banner, onClose, onSaved }: Props) {
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
            <Image
              src={form.image}
              alt=""
              className="h-24 w-full rounded-md object-contain"
              width={120}
              height={96}
            />
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

export default BannerModal;
