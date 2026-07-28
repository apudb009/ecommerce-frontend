'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Review, PaginatedResponse } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import StarRating from '@/components/ui/StarRating';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

interface ReviewSummary {
  averageRating: number | null;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
}

export default function ReviewSection({ productId }: { productId: number }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const { settings } = useSettingsStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ── FETCH REVIEWS ───────────────────────────────────
  const fetchReviews = async () => {
    try {
      const { data } = await api.get<PaginatedResponse<Review, ReviewSummary>>(
        `/products/${productId}/reviews`,
      );
      setReviews(data.data);
      setSummary(data.summary!);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  // ── FETCH MY REVIEW ─────────────────────────────────
  const fetchMyReview = async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/products/${productId}/reviews/mine`);
      setMyReview(data);
    } catch {
      setMyReview(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchReviews();
      await fetchMyReview();
    };
    if ((settings?.allow_reviews as unknown as boolean) === false) {
      return;
    }
    load();
  }, [productId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReviewSubmitted = () => {
    setShowForm(false);
    void fetchReviews();
    void fetchMyReview();
  };

  if ((settings?.allow_reviews as unknown as boolean) === false) return null;

  return (
    <div className="border-t pt-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Customer Reviews</h2>

      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <>
          {/* ── SUMMARY ─────────────────────────────────── */}
          <div className="mb-6 flex flex-col gap-6 rounded-lg border bg-gray-50 p-6 sm:flex-row sm:items-center">
            <div className="text-center sm:border-r sm:pr-6">
              <p className="text-4xl font-bold text-gray-900">{summary?.averageRating ?? '–'}</p>
              <StarRating rating={Math.round(summary?.averageRating || 0)} />
              <p className="mt-1 text-sm text-gray-500">{summary?.totalReviews || 0} reviews</p>
            </div>

            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary?.ratingBreakdown?.[star] || 0;
                const total = summary?.totalReviews || 1;
                const pct = (count / total) * 100;

                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-3">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── WRITE REVIEW BUTTON ─────────────────────── */}
          {user && !myReview && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Write a Review
            </button>
          )}

          {!user && (
            <p className="mb-6 text-sm text-gray-500">
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>{' '}
              to write a review (must have purchased this product)
            </p>
          )}

          {/* ── REVIEW FORM ─────────────────────────────── */}
          {showForm && (
            <ReviewForm
              productId={productId}
              onClose={() => setShowForm(false)}
              onSubmitted={handleReviewSubmitted}
            />
          )}

          {/* ── MY REVIEW (if exists) ───────────────────── */}
          {myReview && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Your Review</span>
                <StarRating rating={myReview.rating} size="sm" />
              </div>
              {myReview.comment && <p className="text-sm text-gray-700">{myReview.comment}</p>}
            </div>
          )}

          {/* ── REVIEWS LIST ─────────────────────────────── */}
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews
                .filter((r) => r.user.id !== myReview?.user.id)
                .map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {review.user.name || review.user.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── REVIEW FORM ──────────────────────────────────────
function ReviewForm({
  productId,
  onClose,
  onSubmitted,
}: {
  productId: number;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment: comment || undefined });
      toast.success('Review submitted!');
      onSubmitted();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'You must purchase and receive this product before reviewing',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Write a Review</h3>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-600">Rating</label>
        <StarRating rating={rating} interactive size="lg" onChange={setRating} />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-600">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Share your experience with this product..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
