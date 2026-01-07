/**
 * Reviews List Component
 */

import { useState } from 'react';
import { Review } from '../../types';
import Rating from '../common/Rating';
import Pagination from '../common/Pagination';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';

interface ReviewsListProps {
  reviews: Review[];
  totalReviews: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilterByRating?: (rating: number | null) => void;
  canReview?: boolean;
  onAddReview?: () => void;
}

export default function ReviewsList({
  reviews,
  totalReviews,
  currentPage,
  pageSize,
  onPageChange,
  onFilterByRating,
  canReview = false,
  onAddReview,
}: ReviewsListProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
    if (onFilterByRating) {
      onFilterByRating(rating);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(totalReviews / pageSize);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-semibold">
          Отзывы ({totalReviews})
        </h3>

        <div className="flex items-center gap-2">
          {/* Rating Filter */}
          {onFilterByRating && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Фильтр:</span>
              <select
                value={filterRating || ''}
                onChange={(e) => handleFilterChange(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Все</option>
                <option value="5">5 звёзд</option>
                <option value="4">4 звезды</option>
                <option value="3">3 звезды</option>
                <option value="2">2 звезды</option>
                <option value="1">1 звезда</option>
              </select>
            </div>
          )}

          {/* Add Review Button */}
          {canReview && onAddReview && (
            <Button size="sm" onClick={onAddReview}>
              Написать отзыв
            </Button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
          title="Пока нет отзывов"
          description="Будьте первым, кто оставит отзыв о этом товаре"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Rating value={review.rating} readonly size="sm" />
                  {review.verified_purchase && (
                    <span className="ml-2 text-xs text-green-600 font-medium">
                      ✓ Подтверждённая покупка
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
              )}

              {review.text && (
                <p className="text-gray-700 mb-3">{review.text}</p>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Count */}
              {review.helpful_count > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {review.helpful_count} {review.helpful_count === 1 ? 'человек' : 'человека'} нашли это полезным
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
