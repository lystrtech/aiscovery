import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReviewStatus, ReviewTargetType } from '@prisma/client';
import ExpertReview from '@/components/ExpertReview';
import UserReviews from '@/components/UserReviews';
import { prisma } from '@/lib/prisma';
import { getOrganizationSchemaForCompany } from '@/lib/schema/entities';
import { getAggregateRating, getReviewSchemaItems } from '@/lib/schema/reviews';
import { absoluteUrl, robotsFromString } from '@/lib/seo';
import type { CompanySeoFields, ReviewWithUser } from '@/lib/types/reviews';

type CompanyPageProps = {
  params: { slug: string };
};

async function getCompanyForMetadata(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
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
      ogImageUrl: true
    }
  });
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const company = await getCompanyForMetadata(params.slug);

  if (!company) {
    return {
      title: 'Company Not Found',
      robots: { index: false, follow: false }
    };
  }

  const title = company.seoTitle ?? `${company.name} – AI Company Profile & Reviews`;
  const description = company.seoDescription ?? company.shortDescription ?? `Read reviews and analysis for ${company.name}.`;
  const canonical = company.seoCanonicalUrl ?? absoluteUrl(`/companies/${company.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    robots: robotsFromString(company.seoRobots),
    openGraph: {
      title: company.ogTitle ?? title,
      description: company.ogDescription ?? description,
      type: 'website',
      url: canonical,
      images: company.ogImageUrl ? [{ url: company.ogImageUrl }] : undefined
    }
  };
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      },
      companyCategories: {
        include: { category: true }
      }
    }
  });

  if (!company || !company.isActive) {
    notFound();
  }

  const [expertReview, userReviews, allApprovedReviews] = await Promise.all([
    prisma.review.findFirst({
      where: {
        companyId: company.id,
        targetType: ReviewTargetType.COMPANY,
        status: ReviewStatus.APPROVED,
        isExpert: true
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    }),
    prisma.review.findMany({
      where: {
        companyId: company.id,
        targetType: ReviewTargetType.COMPANY,
        status: ReviewStatus.APPROVED,
        isExpert: false
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    }),
    prisma.review.findMany({
      where: {
        companyId: company.id,
        targetType: ReviewTargetType.COMPANY,
        status: ReviewStatus.APPROVED
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    })
  ]);

  const companyForSchema: CompanySeoFields = {
    name: company.name,
    slug: company.slug,
    websiteUrl: company.websiteUrl,
    logoUrl: company.logoUrl,
    shortDescription: company.shortDescription,
    seoTitle: company.seoTitle,
    seoDescription: company.seoDescription,
    seoCanonicalUrl: company.seoCanonicalUrl,
    seoRobots: company.seoRobots,
    ogTitle: company.ogTitle,
    ogDescription: company.ogDescription,
    ogImageUrl: company.ogImageUrl
  };

  const typedReviews = allApprovedReviews as ReviewWithUser[];
  const aggregateRating = getAggregateRating(typedReviews);
  const reviewSchemaItems = getReviewSchemaItems(typedReviews);
  const organizationJsonLd = getOrganizationSchemaForCompany(companyForSchema, aggregateRating, reviewSchemaItems);

  return (
    <section className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c')
        }}
      />

      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">Company profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{company.name}</h1>
        {company.shortDescription ? <p className="mt-3 text-slate-600">{company.shortDescription}</p> : null}
      </header>

      <ExpertReview itemType="company" name={company.name} expertReview={(expertReview as ReviewWithUser | null) ?? null} />

      <UserReviews reviews={userReviews as ReviewWithUser[]} />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Products</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {company.products.map((product) => (
            <li key={product.id}>
              <Link href={`/products/${product.slug}`} className="no-underline">
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {company.companyCategories.map(({ category }) => (
            <Link
              href={`/categories/${category.slug}`}
              key={category.id}
              className="rounded-full border border-slate-300 px-3 py-1 text-sm no-underline"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
