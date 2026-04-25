import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { requireAdmin } from '@/lib/auth/require-admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Admin</h2>
        <nav className="mt-4 space-y-2 text-sm">
          <Link href="/admin" className="block rounded px-2 py-1 hover:bg-slate-100 no-underline">Dashboard</Link>
          <Link href="/admin/companies" className="block rounded px-2 py-1 hover:bg-slate-100 no-underline">Companies</Link>
          <Link href="/admin/products" className="block rounded px-2 py-1 hover:bg-slate-100 no-underline">Products</Link>
          <Link href="/admin/categories" className="block rounded px-2 py-1 hover:bg-slate-100 no-underline">Categories</Link>
        </nav>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
