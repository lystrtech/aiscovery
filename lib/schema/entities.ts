import type { Company, Product } from '@prisma/client';
import type { AggregateRatingData } from './reviews';

type ReviewSchemaItem = {
  '@type': 'Review';
  author: { '@type': 'Person'; name: string };
  name?: string;
  reviewBody?: string;
  datePublished: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: number;
    worstRating: number;
  };
};

export function getOrganizationSchemaForCompany(
  company: Pick<Company, 'name' | 'websiteUrl' | 'logoUrl' | 'shortDescription'>,
  aggregateRating: AggregateRatingData | null,
  reviews: ReviewSchemaItem[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: company.websiteUrl ?? undefined,
    logo: company.logoUrl ?? undefined,
    description: company.shortDescription ?? undefined,
    aggregateRating: aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: aggregateRating.ratingValue,
          ratingCount: aggregateRating.ratingCount,
          bestRating: 5,
          worstRating: 1
        }
      : undefined,
    review: reviews.length > 0 ? reviews : undefined
  };
}

export function getSoftwareAppSchemaForProduct(
  product: Pick<Product, 'name' | 'shortDescription' | 'pricingModel' | 'deployment'>,
  company: Pick<Company, 'name' | 'websiteUrl'>,
  aggregateRating: AggregateRatingData | null,
  reviews: ReviewSchemaItem[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.shortDescription ?? undefined,
    applicationCategory: 'BusinessApplication',
    operatingSystem: product.deployment?.includes('API') ? 'Web, API' : 'Web',
    creator: {
      '@type': 'Organization',
      name: company.name,
      url: company.websiteUrl ?? undefined
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.pricingModel?.toLowerCase().includes('free') ? '0' : '49',
      category: product.pricingModel ?? 'Subscription',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: aggregateRating.ratingValue,
          ratingCount: aggregateRating.ratingCount,
          bestRating: 5,
          worstRating: 1
        }
      : undefined,
    review: reviews.length > 0 ? reviews : undefined
  };
}
