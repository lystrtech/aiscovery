'use client';

import { useMemo, useState } from 'react';
import type { ReviewWithUser } from '@/lib/types/reviews';

type UserReviewsProps = {
  reviews: ReviewWithUser[];
};

type SortMode = 'recent' | 'highest';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}

function renderStars(score: number) {
  const full = Math.round(score);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}

export default function UserReviews({ reviews }: UserReviewsProps) {
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortMode === 'highest') {
        if (b.rating !== a.rating) return b.rating - a.rating;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, sortMode]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">User reviews</h2>
          <p className="mt-1 text-sm text-slate-600">Community feedback from verified readers.</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Community score</p>
          <p className="text-2xl font-bold text-slate-900">
            {averageRating > 0 ? averageRating.toFixed(1) : '–'} <span className="text-base font-medium text-slate-500">/ 5</span>
          </p>
          <p className="text-xs text-slate-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
          <p className="mt-1 text-sm text-amber-500">{averageRating > 0 ? renderStars(averageRating) : 'No ratings yet'}</p>
        </div>
      </div>

      <div className="mt-4 inline-flex rounded-lg border border-slate-200 p-1 text-sm">
        <button
          type="button"
          onClick={() => setSortMode('recent')}
          className={`rounded-md px-3 py-1 ${sortMode === 'recent' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
        >
          Most recent
        </button>
        <button
          type="button"
          onClick={() => setSortMode('highest')}
          className={`rounded-md px-3 py-1 ${sortMode === 'highest' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
        >
          Highest rated
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{review.user.name ?? 'Anonymous reviewer'}</p>
                <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-amber-500">{renderStars(review.rating)} · {review.rating.toFixed(1)}/5</p>
              {review.title ? <h3 className="mt-2 font-medium text-slate-900">{review.title}</h3> : null}
              {review.body ? <p className="mt-1 text-sm leading-6 text-slate-700">{review.body}</p> : null}
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-600">No community reviews yet.</p>
        )}
      </div>
    </section>
  );
}
