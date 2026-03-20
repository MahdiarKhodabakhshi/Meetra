'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchEvents } from '@/lib/events-api';
import { formatEventDate } from '@/lib/events-api';
import { getMyProfile } from '@/lib/profiles-api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import type { Event, ProfileOut } from '@/lib/types';

function QuickAction({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="feature-card p-5 h-full cursor-pointer">
        <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-3">
          {icon}
        </div>
        <h3 className="font-semibold text-[var(--foreground)] text-sm mb-1">{title}</h3>
        <p className="text-xs text-[var(--muted)] leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, accessToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    let mounted = true;

    Promise.all([
      fetchEvents(accessToken, { page: 1, page_size: 5 }).then((r) => r.data),
      getMyProfile(accessToken).then((r) => r.data),
    ])
      .then(([evData, profData]) => {
        if (!mounted) return;
        if (evData) setEvents(evData.items);
        if (profData) setProfile(profData);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const profileComplete =
    profile &&
    profile.headline &&
    profile.summary &&
    profile.skills.length > 0;

  const greeting = user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{greeting}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Your networking intelligence at a glance.
        </p>
      </div>

      {/* Profile completeness banner */}
      {!profileComplete && (
        <div className="card p-5 border-[var(--accent)] bg-[var(--accent)]/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Complete your profile</h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                {!profile?.headline && !profile?.summary
                  ? 'Upload your resume or fill in your profile to get better matches.'
                  : 'Add more details to improve your match quality.'}
              </p>
            </div>
            <Link href="/profile">
              <Button size="sm">Complete profile</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          title="Browse Events"
          description="Find upcoming events and RSVP to get matched."
          href="/events"
        />
        <QuickAction
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
          title="Your Profile"
          description="Upload your resume and manage your profile."
          href="/profile"
        />
        <QuickAction
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
          title="Set Goals"
          description="Define what you want from networking."
          href="/goals"
        />
        <QuickAction
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          title="Connections"
          description="Track people you've met and conversations."
          href="/connections"
        />
      </div>

      {/* Upcoming events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events you can join and get matched at.</CardDescription>
            </div>
            <Link href="/events">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
        </CardHeader>
        {events.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-4">No upcoming events yet. Check back soon!</p>
        ) : (
          <ul className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <li key={event.id}>
                <Link href={`/events/${event.id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--muted-bg)] transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--foreground)] truncate">{event.title}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {formatEventDate(event.starts_at)}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                    <Badge status={event.status as 'draft' | 'published' | 'closed' | 'cancelled'}>
                      {event.status}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Stats overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Profile Status</p>
          <p className="text-2xl font-semibold text-[var(--foreground)] mt-1">
            {profileComplete ? 'Complete' : 'Incomplete'}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            {profile?.skills.length ?? 0} skills · {profile?.titles.length ?? 0} titles
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Available Events</p>
          <p className="text-2xl font-semibold text-[var(--foreground)] mt-1">{events.length}</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Browse and RSVP to get matched
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Connections</p>
          <p className="text-2xl font-semibold text-[var(--foreground)] mt-1">--</p>
          <p className="text-xs text-[var(--accent)] mt-1">
            Coming soon
          </p>
        </Card>
      </div>
    </div>
  );
}
