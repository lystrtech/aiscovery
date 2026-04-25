'use client';

type SeoSnippetPreviewProps = {
  title: string;
  description: string;
  url: string;
};

export default function SeoSnippetPreview({ title, description, url }: SeoSnippetPreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="truncate text-xs text-emerald-700">{url}</p>
      <h4 className="mt-1 line-clamp-2 text-lg font-medium text-blue-700">{title}</h4>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
