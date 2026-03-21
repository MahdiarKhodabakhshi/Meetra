'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/app/components/ui/button';
import { Logo } from '@/app/components/ui/logo';

function NavLinks() {
  const path = usePathname();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isOrganizer = role === 'organizer' || role === 'admin';
  const isAdmin = role === 'admin';

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/events', label: 'Events' },
    { href: '/connections', label: 'Connections' },
    { href: '/goals', label: 'Goals' },
    { href: '/profile', label: 'Profile' },
  ];

  const conditionalLinks = [
    ...(isOrganizer ? [{ href: '/organizer', label: 'Organizer' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {[...links, ...conditionalLinks].map(({ href, label }) => {
        const isActive = path === href || (href !== '/dashboard' && path.startsWith(href + '/'));
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isActive
                ? 'font-medium text-[var(--accent)] bg-[var(--accent)]/10'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
            }`}
          >
            {label}
          </Link>
        );
      })}
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--muted-bg)]">
        <div className="card max-w-sm p-8 text-center bg-[var(--background)]">
          <div className="flex justify-center mb-4">
            <Logo iconHeight={40} textClass="text-xl" />
          </div>
          <p className="mb-6 text-[var(--muted)]">Sign in to access your networking intelligence.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button variant="primary">Sign in</Button>
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
    <div className="min-h-screen flex flex-col bg-[var(--muted-bg)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo iconHeight={48} linkTo="/dashboard" lightText textClass="text-xl" className="!gap-1" iconClassName="drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]" />
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <NavLinks />
            </div>
            <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4">
              <span className="text-sm text-[var(--muted)] hidden sm:inline" title={user.email ?? undefined}>
                {user.name || user.email || user.user_id}
              </span>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden border-t border-[var(--border)] px-4 py-2 overflow-x-auto">
          <NavLinks />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
