import type { Review, User, Role, ReviewTargetType, ReviewStatus } from '@prisma/client';

export type CompanySeoFields = {
  name: string;
  slug: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonicalUrl: string | null;
  seoRobots: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
};

export type ReviewWithUser = Pick<
  Review,
  'id' | 'rating' | 'title' | 'body' | 'isExpert' | 'createdAt' | 'targetType' | 'status'
> & {
  user: Pick<User, 'name' | 'role'>;
};

export type ApprovedReviewWithUser = ReviewWithUser & {
  status: ReviewStatus.APPROVED;
  targetType: ReviewTargetType;
  user: {
    name: string | null;
    role: Role;
  };
};
