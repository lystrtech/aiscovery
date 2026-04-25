import type { ReviewWithUser } from '@/lib/types/reviews';

export type AggregateRatingData = {
  ratingValue: string;
  ratingCount: number;
};

export function getAggregateRating(reviews: ReviewWithUser[]): AggregateRatingData | null {
  if (reviews.length === 0) return null;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    ratingValue: (total / reviews.length).toFixed(1),
    ratingCount: reviews.length
  };
}

export function getReviewSchemaItems(reviews: ReviewWithUser[]) {
  return reviews
    .filter((review) => review.body)
    .map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.user.name ?? 'AIScovery User'
      },
      name: review.title ?? undefined,
      reviewBody: review.body ?? undefined,
      datePublished: review.createdAt.toISOString(),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      }
    }));
}
