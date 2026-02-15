'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/app/components/ui/button';

function NavLinks() {
  const path = usePathname();
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm">
      <Link
        href="/events"
        className={path === '/events' ? 'font-medium text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}
      >
        Events
      </Link>
      <Link
        href="/profile"
        className={path === '/profile' ? 'font-medium text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}
      >
        Profile
      </Link>
      {isOrganizer && (
        <Link
          href="/organizer"
          className={path === '/organizer' ? 'font-medium text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}
        >
          Organizer
        </Link>
      )}
      {isAdmin && (
        <Link
          href="/admin"
          className={path === '/admin' ? 'font-medium text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}
        >
          Admin
        </Link>
      )}
    </nav>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card max-w-sm p-6 text-center">
          <p className="mb-4 text-[var(--muted)]">You need to sign in to view this page.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button variant="primary">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/events" className="font-semibold text-[var(--foreground)]">
            Meetra
          </Link>
          <div className="flex items-center gap-4">
            <NavLinks />
            <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4">
              <span className="text-sm text-[var(--muted)]" title={user.email ?? undefined}>
                {user.name || user.email || user.user_id}
              </span>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
