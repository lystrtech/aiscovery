import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { absoluteUrl, robotsFromString } from '@/lib/seo';

type CategoryPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      seoCanonicalUrl: true,
      seoRobots: true,
      ogTitle: true,
      ogDescription: true,
      ogImageUrl: true
    }
  });

  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false }
    };
  }

  const title = category.seoTitle ?? `${category.name} – AI Companies & Tools`;
  const description = category.seoDescription ?? category.description ?? `Explore ${category.name} companies and products.`;
  const canonical = category.seoCanonicalUrl ?? absoluteUrl(`/categories/${category.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    robots: robotsFromString(category.seoRobots),
    openGraph: {
      title: category.ogTitle ?? title,
      description: category.ogDescription ?? description,
      type: 'website',
      url: canonical,
      images: category.ogImageUrl ? [{ url: category.ogImageUrl }] : undefined
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      companyCategories: {
        include: { company: true }
      },
      productCategories: {
        include: { product: { include: { company: true } } }
      }
    }
  });

  if (!category) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">{category.pillar.replaceAll('_', ' ')}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description ? <p className="mt-3 text-slate-600">{category.description}</p> : null}
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Companies in this category</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          {category.companyCategories.map(({ company }) => (
            <li key={company.id}>
              <Link href={`/companies/${company.slug}`} className="no-underline">
                {company.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Products in this category</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          {category.productCategories.map(({ product }) => (
            <li key={product.id}>
              <Link href={`/products/${product.slug}`} className="no-underline">
                {product.name}
              </Link>
              <span className="text-slate-500"> · {product.company.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
