'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

export default function ConnectionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Connections</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Track the people you've met and build lasting professional relationships.
        </p>
      </div>

      {/* Coming soon hero */}
      <Card className="p-8 sm:p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Connection tracking is coming soon
        </h2>
        <p className="text-[var(--muted)] max-w-md mx-auto mb-8 leading-relaxed">
          Soon you'll be able to save connections from events, add personal notes, track follow-ups, and reflect on conversations to improve your networking over time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/events">
            <Button>Browse events</Button>
          </Link>
          <Link href="/profile">
            <Button variant="secondary">Complete your profile</Button>
          </Link>
        </div>
      </Card>

      {/* Preview cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            ),
            title: 'Save Connections',
            description: 'After meeting someone at an event, save them to your network with one click.',
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            ),
            title: 'Add Notes',
            description: 'Record what you talked about, action items, and personal impressions.',
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            ),
            title: 'Track Progress',
            description: 'See your networking activity, follow-up rate, and relationship strength over time.',
          },
        ].map((item) => (
          <Card key={item.title} className="p-5 opacity-75">
            <div className="w-9 h-9 rounded-lg bg-[var(--muted-bg)] text-[var(--muted)] flex items-center justify-center mb-3">
              {item.icon}
            </div>
            <h3 className="font-semibold text-[var(--foreground)] text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{item.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
