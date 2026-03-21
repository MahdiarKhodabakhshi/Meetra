'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from '@/app/components/ui/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--muted-bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo iconHeight={48} linkTo="/" lightText textClass="text-xl" className="!gap-1" iconClassName="drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]" />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="py-6 text-center text-sm text-[var(--muted)]">
        Meetra — Intelligent networking for meaningful connections
      </footer>
    </div>
  );
}
