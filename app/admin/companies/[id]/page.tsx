import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/require-admin';
import SeoPanel from '@/components/SeoPanel';
import { absoluteUrl } from '@/lib/seo';

type CompanyEditPageProps = {
  params: { id: string };
};

async function updateCompany(formData: FormData) {
  'use server';

  await requireAdmin();

  const companyId = Number(formData.get('companyId'));
  if (!Number.isFinite(companyId)) {
    throw new Error('Invalid company id');
  }

  const categoryIds = formData
    .getAll('categoryIds')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  await prisma.company.update({
    where: { id: companyId },
    data: {
      name: String(formData.get('name') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      websiteUrl: String(formData.get('websiteUrl') ?? '') || null,
      logoUrl: String(formData.get('logoUrl') ?? '') || null,
      shortDescription: String(formData.get('shortDescription') ?? '') || null,
      longDescription: String(formData.get('longDescription') ?? '') || null,
      headquarters: String(formData.get('headquarters') ?? '') || null,
      foundedYear: Number(formData.get('foundedYear')) || null,
      employeeRange: String(formData.get('employeeRange') ?? '') || null,
      isActive: formData.get('isActive') === 'on',
      seoTitle: String(formData.get('seoTitle') ?? '') || null,
      seoDescription: String(formData.get('seoDescription') ?? '') || null,
      seoCanonicalUrl: String(formData.get('seoCanonicalUrl') ?? '') || null,
      seoRobots: String(formData.get('seoRobots') ?? '') || null,
      ogTitle: String(formData.get('ogTitle') ?? '') || null,
      ogDescription: String(formData.get('ogDescription') ?? '') || null,
      ogImageUrl: String(formData.get('ogImageUrl') ?? '') || null,
      companyCategories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({ categoryId }))
      }
    }
  });

  revalidatePath('/admin/companies');
  revalidatePath(`/admin/companies/${companyId}`);
  redirect(`/admin/companies/${companyId}`);
}

export default async function AdminCompanyEditPage({ params }: CompanyEditPageProps) {
  const id = Number(params.id);
  const [company, categories] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: { companyCategories: true }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ]);

  if (!company) {
    notFound();
  }

  const selectedCategoryIds = new Set(company.companyCategories.map((item) => item.categoryId));

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Edit company</h1>
        <p className="text-sm text-slate-600">Update profile fields, category mappings, and SEO metadata.</p>
      </header>

      <form action={updateCompany} className="space-y-6">
        <input type="hidden" name="companyId" value={company.id} />

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Basic information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm"><span className="font-medium">Name</span><input name="name" defaultValue={company.name} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Slug</span><input name="slug" defaultValue={company.slug} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Website URL</span><input name="websiteUrl" defaultValue={company.websiteUrl ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Logo URL</span><input name="logoUrl" defaultValue={company.logoUrl ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm md:col-span-2"><span className="font-medium">Short description</span><textarea name="shortDescription" defaultValue={company.shortDescription ?? ''} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm md:col-span-2"><span className="font-medium">Long description</span><textarea name="longDescription" defaultValue={company.longDescription ?? ''} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Headquarters</span><input name="headquarters" defaultValue={company.headquarters ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Founded year</span><input name="foundedYear" type="number" defaultValue={company.foundedYear ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Employee range</span><input name="employeeRange" defaultValue={company.employeeRange ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="flex items-center gap-2 text-sm font-medium"><input name="isActive" type="checkbox" defaultChecked={company.isActive} /> Active</label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={selectedCategoryIds.has(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </section>

        <SeoPanel
          entityName={company.name}
          defaultTitle={`${company.name} – AI Company Profile & Reviews`}
          defaultDescription={company.shortDescription ?? `Read reviews and insights for ${company.name}.`}
          previewUrl={absoluteUrl(`/companies/${company.slug}`)}
          initialValues={{
            seoTitle: company.seoTitle,
            seoDescription: company.seoDescription,
            seoCanonicalUrl: company.seoCanonicalUrl,
            seoRobots: company.seoRobots,
            ogTitle: company.ogTitle,
            ogDescription: company.ogDescription,
            ogImageUrl: company.ogImageUrl
          }}
        />

        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save company</button>
      </form>
    </section>
  );
}
