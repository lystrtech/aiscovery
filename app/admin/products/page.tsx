import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, company: { select: { name: true } } }
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
      <ul className="mt-4 divide-y divide-slate-200">
        {products.map((product) => (
          <li key={product.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">{product.name}</p>
              <p className="text-sm text-slate-500">{product.company.name} · /{product.slug}</p>
            </div>
            <Link href={`/admin/products/${product.id}`} className="rounded border border-slate-300 px-3 py-1 text-sm no-underline">Edit</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
