import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login | AIScovery'
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Admin login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign in with your email and password. Passwords are stored as bcrypt hashes in `User.passwordHash`.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </section>
  );
}
