'use client';

import { useMemo, useState } from 'react';
import SeoSnippetPreview from '@/components/SeoSnippetPreview';

type SeoPanelProps = {
  entityName: string;
  defaultTitle: string;
  defaultDescription: string;
  previewUrl: string;
  initialValues: {
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoCanonicalUrl?: string | null;
    seoRobots?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImageUrl?: string | null;
  };
};

export default function SeoPanel({
  entityName,
  defaultTitle,
  defaultDescription,
  previewUrl,
  initialValues
}: SeoPanelProps) {
  const [seoTitle, setSeoTitle] = useState(initialValues.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialValues.seoDescription ?? '');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(initialValues.seoCanonicalUrl ?? '');
  const [seoRobots, setSeoRobots] = useState(initialValues.seoRobots ?? 'index,follow');
  const [ogTitle, setOgTitle] = useState(initialValues.ogTitle ?? '');
  const [ogDescription, setOgDescription] = useState(initialValues.ogDescription ?? '');
  const [ogImageUrl, setOgImageUrl] = useState(initialValues.ogImageUrl ?? '');

  const effectiveTitle = useMemo(() => seoTitle.trim() || defaultTitle, [defaultTitle, seoTitle]);
  const effectiveDescription = useMemo(
    () => seoDescription.trim() || defaultDescription,
    [defaultDescription, seoDescription]
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-semibold text-slate-900">SEO</h3>
      <p className="mt-1 text-sm text-slate-600">Manage metadata and social preview settings for {entityName}.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">SEO title</span>
          <input name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Canonical URL</span>
          <input name="seoCanonicalUrl" value={seoCanonicalUrl} onChange={(e) => setSeoCanonicalUrl(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">SEO description</span>
          <textarea name="seoDescription" rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Robots</span>
          <input name="seoRobots" value={seoRobots} onChange={(e) => setSeoRobots(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">OG title</span>
          <input name="ogTitle" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">OG description</span>
          <textarea name="ogDescription" rows={2} value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">OG image URL</span>
          <input name="ogImageUrl" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-slate-700">Google snippet preview</p>
        <SeoSnippetPreview title={effectiveTitle} description={effectiveDescription} url={seoCanonicalUrl || previewUrl} />
      </div>
    </section>
  );
}
