import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/apiClient';
import StarRating from '../shared/StarRating';
import InteractiveStarRatingInput from './InteractiveStarRatingInput';

const RestaurantReviewsModal = ({ isOpen, onClose, restaurantId, restaurantName }) => {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flash, setFlash] = useState(false);

  const canSubmit = useMemo(() => {
    return Number.isFinite(rating) && rating >= 0.5 && rating <= 5 && comment.trim().length > 0;
  }, [rating, comment]);

  useEffect(() => {
    if (!isOpen || !restaurantId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const res = await apiClient.get(`/restaurants/${restaurantId}/reviews/positive`);
        const items = res?.data?.data?.reviews || res?.data?.data || res?.data?.reviews || [];
        if (!cancelled) setReviews(items);
      } catch (e) {
        if (!cancelled) setLoadError(e?.response?.data?.message || e?.message || 'Failed to load reviews');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, restaurantId]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId || !canSubmit) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/restaurants/${restaurantId}/reviews`, {
        rating,
        comment: comment.trim()
      });

      setRating(0);
      setComment('');
      setFlash(true);

      const res = await apiClient.get(`/restaurants/${restaurantId}/reviews/positive`);
      const items = res?.data?.data?.reviews || res?.data?.data || res?.data?.reviews || [];
      setReviews(items);
    } catch (e2) {
      setLoadError(e2?.response?.data?.message || e2?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 overflow-hidden">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              <p className="text-sm text-gray-600">{restaurantName || 'Restaurant'}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 pb-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900">Write a Review</div>
                {flash && (
                  <div className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    Thanks for your review!
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <InteractiveStarRatingInput value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent min-h-[100px]"
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full bg-grub-red hover:bg-grub-red text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>

              {loadError && (
                <div className="mt-3 text-sm text-red-600">{loadError}</div>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-gray-600">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-gray-600">No positive reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id || `${r.createdAt}-${r.comment}`} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <StarRating value={r.rating || 0} size={16} className="text-gray-900" />
                    <div className="text-xs text-gray-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div className="mt-2 text-gray-800 whitespace-pre-wrap">{r.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantReviewsModal;
