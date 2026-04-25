import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/require-admin';
import SeoPanel from '@/components/SeoPanel';
import { absoluteUrl } from '@/lib/seo';

type ProductEditPageProps = { params: { id: string } };

async function updateProduct(formData: FormData) {
  'use server';

  await requireAdmin();

  const productId = Number(formData.get('productId'));
  if (!Number.isFinite(productId)) throw new Error('Invalid product id');

  const categoryIds = formData.getAll('categoryIds').map(Number).filter(Number.isFinite);

  await prisma.product.update({
    where: { id: productId },
    data: {
      companyId: Number(formData.get('companyId')),
      name: String(formData.get('name') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      shortDescription: String(formData.get('shortDescription') ?? '') || null,
      longDescription: String(formData.get('longDescription') ?? '') || null,
      pricingModel: String(formData.get('pricingModel') ?? '') || null,
      deployment: String(formData.get('deployment') ?? '') || null,
      isActive: formData.get('isActive') === 'on',
      seoTitle: String(formData.get('seoTitle') ?? '') || null,
      seoDescription: String(formData.get('seoDescription') ?? '') || null,
      seoCanonicalUrl: String(formData.get('seoCanonicalUrl') ?? '') || null,
      seoRobots: String(formData.get('seoRobots') ?? '') || null,
      ogTitle: String(formData.get('ogTitle') ?? '') || null,
      ogDescription: String(formData.get('ogDescription') ?? '') || null,
      ogImageUrl: String(formData.get('ogImageUrl') ?? '') || null,
      productCategories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({ categoryId }))
      }
    }
  });

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

export default async function AdminProductEditPage({ params }: ProductEditPageProps) {
  const id = Number(params.id);
  const [product, categories, companies] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { company: true, productCategories: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.company.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
  ]);

  if (!product) notFound();

  const selectedCategoryIds = new Set(product.productCategories.map((item) => item.categoryId));

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Edit product</h1>
      </header>

      <form action={updateProduct} className="space-y-6">
        <input type="hidden" name="productId" value={product.id} />

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Basic information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm"><span className="font-medium">Company</span><select name="companyId" defaultValue={product.companyId} className="w-full rounded-lg border border-slate-300 px-3 py-2">{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Name</span><input name="name" defaultValue={product.name} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Slug</span><input name="slug" defaultValue={product.slug} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Pricing model</span><input name="pricingModel" defaultValue={product.pricingModel ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Deployment</span><input name="deployment" defaultValue={product.deployment ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm md:col-span-2"><span className="font-medium">Short description</span><textarea name="shortDescription" defaultValue={product.shortDescription ?? ''} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm md:col-span-2"><span className="font-medium">Long description</span><textarea name="longDescription" defaultValue={product.longDescription ?? ''} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="flex items-center gap-2 text-sm font-medium"><input name="isActive" type="checkbox" defaultChecked={product.isActive} /> Active</label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm"><input type="checkbox" name="categoryIds" value={category.id} defaultChecked={selectedCategoryIds.has(category.id)} />{category.name}</label>)}</div>
        </section>

        <SeoPanel
          entityName={product.name}
          defaultTitle={`${product.name} by ${product.company.name} – AI Tool Review & Ratings`}
          defaultDescription={product.shortDescription ?? `Read reviews and insights for ${product.name}.`}
          previewUrl={absoluteUrl(`/products/${product.slug}`)}
          initialValues={{
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
            seoCanonicalUrl: product.seoCanonicalUrl,
            seoRobots: product.seoRobots,
            ogTitle: product.ogTitle,
            ogDescription: product.ogDescription,
            ogImageUrl: product.ogImageUrl
          }}
        />

        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save product</button>
      </form>
    </section>
  );
}
