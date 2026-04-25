import { Pillar } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/require-admin';
import SeoPanel from '@/components/SeoPanel';
import { absoluteUrl } from '@/lib/seo';

type CategoryEditPageProps = { params: { id: string } };

async function updateCategory(formData: FormData) {
  'use server';

  await requireAdmin();

  const categoryId = Number(formData.get('categoryId'));
  if (!Number.isFinite(categoryId)) throw new Error('Invalid category id');

  const parentIdRaw = String(formData.get('parentId') ?? '');

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: String(formData.get('name') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      pillar: String(formData.get('pillar')) as Pillar,
      description: String(formData.get('description') ?? '') || null,
      parentId: parentIdRaw ? Number(parentIdRaw) : null,
      isActive: formData.get('isActive') === 'on',
      seoTitle: String(formData.get('seoTitle') ?? '') || null,
      seoDescription: String(formData.get('seoDescription') ?? '') || null,
      seoCanonicalUrl: String(formData.get('seoCanonicalUrl') ?? '') || null,
      seoRobots: String(formData.get('seoRobots') ?? '') || null,
      ogTitle: String(formData.get('ogTitle') ?? '') || null,
      ogDescription: String(formData.get('ogDescription') ?? '') || null,
      ogImageUrl: String(formData.get('ogImageUrl') ?? '') || null
    }
  });

  revalidatePath('/admin/categories');
  revalidatePath(`/admin/categories/${categoryId}`);
  redirect(`/admin/categories/${categoryId}`);
}

export default async function AdminCategoryEditPage({ params }: CategoryEditPageProps) {
  const id = Number(params.id);
  const [category, parentOptions] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { id: { not: id } }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
  ]);

  if (!category) notFound();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Edit category</h1>
      </header>

      <form action={updateCategory} className="space-y-6">
        <input type="hidden" name="categoryId" value={category.id} />

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Basic information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm"><span className="font-medium">Name</span><input name="name" defaultValue={category.name} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Slug</span><input name="slug" defaultValue={category.slug} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Pillar</span><select name="pillar" defaultValue={category.pillar} className="w-full rounded-lg border border-slate-300 px-3 py-2">{Object.values(Pillar).map((pillar) => <option key={pillar} value={pillar}>{pillar}</option>)}</select></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Parent category</span><select name="parentId" defaultValue={category.parentId ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">No parent</option>{parentOptions.map((parent) => <option key={parent.id} value={parent.id}>{parent.name}</option>)}</select></label>
            <label className="space-y-1 text-sm md:col-span-2"><span className="font-medium">Description</span><textarea name="description" defaultValue={category.description ?? ''} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="flex items-center gap-2 text-sm font-medium"><input name="isActive" type="checkbox" defaultChecked={category.isActive} /> Active</label>
          </div>
        </section>

        <SeoPanel
          entityName={category.name}
          defaultTitle={`${category.name} – AI Companies & Tools`}
          defaultDescription={category.description ?? `Explore ${category.name} companies and products.`}
          previewUrl={absoluteUrl(`/categories/${category.slug}`)}
          initialValues={{
            seoTitle: category.seoTitle,
            seoDescription: category.seoDescription,
            seoCanonicalUrl: category.seoCanonicalUrl,
            seoRobots: category.seoRobots,
            ogTitle: category.ogTitle,
            ogDescription: category.ogDescription,
            ogImageUrl: category.ogImageUrl
          }}
        />

        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save category</button>
      </form>
    </section>
  );
}
