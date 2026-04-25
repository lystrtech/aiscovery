import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReviewStatus, ReviewTargetType } from '@prisma/client';
import ExpertReview from '@/components/ExpertReview';
import UserReviews from '@/components/UserReviews';
import { prisma } from '@/lib/prisma';
import { getSoftwareAppSchemaForProduct } from '@/lib/schema/entities';
import { getAggregateRating, getReviewSchemaItems } from '@/lib/schema/reviews';
import { absoluteUrl, robotsFromString } from '@/lib/seo';
import type { ReviewWithUser } from '@/lib/types/reviews';

type ProductPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      slug: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      seoCanonicalUrl: true,
      seoRobots: true,
      ogTitle: true,
      ogDescription: true,
      ogImageUrl: true,
      company: { select: { name: true } }
    }
  });

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false }
    };
  }

  const title = product.seoTitle ?? `${product.name} by ${product.company.name} – AI Tool Review & Ratings`;
  const description =
    product.seoDescription ?? product.shortDescription ?? `Read reviews and analysis for ${product.name}.`;
  const canonical = product.seoCanonicalUrl ?? absoluteUrl(`/products/${product.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    robots: robotsFromString(product.seoRobots),
    openGraph: {
      title: product.ogTitle ?? title,
      description: product.ogDescription ?? description,
      type: 'website',
      url: canonical,
      images: product.ogImageUrl ? [{ url: product.ogImageUrl }] : undefined
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      company: true,
      productCategories: { include: { category: true } }
    }
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const [expertReview, userReviews, allApprovedReviews] = await Promise.all([
    prisma.review.findFirst({
      where: {
        productId: product.id,
        targetType: ReviewTargetType.PRODUCT,
        status: ReviewStatus.APPROVED,
        isExpert: true
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    }),
    prisma.review.findMany({
      where: {
        productId: product.id,
        targetType: ReviewTargetType.PRODUCT,
        status: ReviewStatus.APPROVED,
        isExpert: false
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    }),
    prisma.review.findMany({
      where: {
        productId: product.id,
        targetType: ReviewTargetType.PRODUCT,
        status: ReviewStatus.APPROVED
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    })
  ]);

  const typedReviews = allApprovedReviews as ReviewWithUser[];
  const aggregateRating = getAggregateRating(typedReviews);
  const reviewSchemaItems = getReviewSchemaItems(typedReviews);
  const softwareJsonLd = getSoftwareAppSchemaForProduct(product, product.company, aggregateRating, reviewSchemaItems);

  return (
    <section className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd).replace(/</g, '\\u003c')
        }}
      />

      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">Product profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-slate-600">{product.shortDescription ?? 'No description yet.'}</p>
        <p className="mt-2 text-sm text-slate-500">
          By{' '}
          <Link href={`/companies/${product.company.slug}`} className="no-underline">
            {product.company.name}
          </Link>
        </p>
      </header>

      <ExpertReview itemType="product" name={product.name} expertReview={(expertReview as ReviewWithUser | null) ?? null} />

      <UserReviews reviews={userReviews as ReviewWithUser[]} />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.productCategories.map(({ category }) => (
            <Link
              href={`/categories/${category.slug}`}
              key={category.id}
              className="rounded-full border px-3 py-1 text-sm no-underline"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
