import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIScovery',
  description: 'Discover leading AI companies and products.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-semibold text-slate-900 no-underline">AIScovery</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/companies" className="no-underline">Companies</Link>
              <Link href="/products/chatgpt" className="no-underline">Products</Link>
              <Link href="/categories/generative-ai-llms" className="no-underline">Categories</Link>
              <Link href="/admin" className="no-underline">Admin</Link>
              <Link href="/login" className="no-underline">Login</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
