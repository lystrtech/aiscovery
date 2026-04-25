import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      name: true,
      slug: true,
      shortDescription: true
    }
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-blue-600">Companies</p>
        <h1 className="text-3xl font-bold tracking-tight">AI companies</h1>
        <p className="text-slate-600">Discover AI vendors, platforms, and research organizations.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <article key={company.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{company.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{company.shortDescription ?? 'No description yet.'}</p>
            <Link href={`/companies/${company.slug}`} className="mt-4 inline-flex text-sm font-medium no-underline">
              View company profile →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
