import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true }
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
      <ul className="mt-4 divide-y divide-slate-200">
        {companies.map((company) => (
          <li key={company.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">{company.name}</p>
              <p className="text-sm text-slate-500">/{company.slug}</p>
            </div>
            <Link href={`/admin/companies/${company.id}`} className="rounded border border-slate-300 px-3 py-1 text-sm no-underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
