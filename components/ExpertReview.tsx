import type { ReviewWithUser } from '@/lib/types/reviews';

type ExpertReviewProps = {
  itemType: 'company' | 'product';
  name: string;
  expertReview: ReviewWithUser | null;
  scaleMax?: number;
};

function getSummary(body: string | null, maxLength = 180) {
  if (!body) return 'Our editorial team review is coming soon.';
  if (body.length <= maxLength) return body;
  return `${body.slice(0, maxLength).trim()}…`;
}

export default function ExpertReview({ itemType, name, expertReview, scaleMax = 5 }: ExpertReviewProps) {
  if (!expertReview) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Expert verdict
        </span>
        <h2 className="mt-3 text-xl font-semibold">{name} has no featured expert review yet</h2>
        <p className="mt-2 text-sm text-slate-600">We’re preparing a detailed expert assessment for this {itemType}.</p>
      </section>
    );
  }

  const summary = getSummary(expertReview.body);

  return (
    <section className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        Expert verdict
      </span>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Editorial score</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {expertReview.rating.toFixed(1)} / {scaleMax}
          </p>
        </div>
        <p className="text-sm text-slate-500">
          By {expertReview.user.name ?? 'AIScovery Editorial'} · {expertReview.user.role}
        </p>
      </div>

      {expertReview.title ? <h3 className="mt-4 text-lg font-semibold text-slate-900">{expertReview.title}</h3> : null}
      <p className="mt-2 text-sm leading-6 text-slate-700">{summary}</p>

      {expertReview.body ? (
        <details className="mt-4 rounded-lg bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">Read full expert review</summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{expertReview.body}</p>
        </details>
      ) : null}
    </section>
  );
}
