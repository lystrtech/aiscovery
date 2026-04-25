import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <p className="text-sm font-medium uppercase tracking-wider text-blue-600">AI discovery platform</p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Find the right AI companies and products.</h1>
      <p className="max-w-3xl text-lg text-slate-600">
        A modern research-first destination for exploring AI vendors, tools, and real expert-backed reviews.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/companies" className="rounded-lg bg-slate-900 px-4 py-2 text-white no-underline">Browse companies</Link>
        <Link href="/categories/generative-ai-llms" className="rounded-lg border border-slate-300 bg-white px-4 py-2 no-underline">Explore categories</Link>
      </div>
    </section>
  );
}
