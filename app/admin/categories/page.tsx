import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true }
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
      <ul className="mt-4 divide-y divide-slate-200">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">{category.name}</p>
              <p className="text-sm text-slate-500">/{category.slug}</p>
            </div>
            <Link href={`/admin/categories/${category.id}`} className="rounded border border-slate-300 px-3 py-1 text-sm no-underline">Edit</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
