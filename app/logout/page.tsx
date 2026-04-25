import LogoutButton from '@/components/auth/LogoutButton';

export default function LogoutPage() {
  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Sign out</h1>
      <p className="mt-2 text-sm text-slate-600">Use the button below to end your session.</p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </section>
  );
}
