'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace('/events');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold text-[var(--foreground)]">
            Meetra
          </Link>
          <Link
            href="/events"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Events
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
