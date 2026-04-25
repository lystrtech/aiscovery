import type { Metadata } from 'next';

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export function absoluteUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}

export function robotsFromString(value: string | null | undefined): Metadata['robots'] {
  if (!value) {
    return { index: true, follow: true };
  }

  const normalized = value.toLowerCase();
  return {
    index: !normalized.includes('noindex'),
    follow: !normalized.includes('nofollow')
  };
}
