'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchEvent, formatEventDate } from '@/lib/events-api';
import { fetchMatchesForEvent } from '@/lib/matches-api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import type { Event } from '@/lib/types';
import type { Match } from '@/lib/types';

export default function EventMatchesPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !eventId) return;
    setLoading(true);
    Promise.all([
      fetchEvent(accessToken, eventId).then((r) => r.data),
      fetchMatchesForEvent(accessToken, eventId).then((r) => r.data ?? []),
    ])
      .then(([ev, list]) => {
        setEvent(ev ?? null);
        setMatches(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [accessToken, eventId]);

  if (loading && !event) {
    return (
      <div className="flex justify-center py-12">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/events" className="link text-sm">Events</Link>
        <span className="text-[var(--muted)]">/</span>
        <Link href={`/events/${eventId}`} className="link text-sm truncate">
          {event?.title ?? eventId}
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium">My matches</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">My matches</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Event-first: matches for {event?.title ?? 'this event'}. Click a match for profile summary and approach suggestions.
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-[var(--destructive)]">{error}</p>
        </Card>
      )}

      {!error && matches.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No matches yet</CardTitle>
            <CardDescription>
              Matches are computed after you RSVP. If you just registered, they may appear shortly.
              Otherwise there may be no other attendees to match with yet.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!error && matches.length > 0 && (
        <ul className="space-y-3">
          {matches.map((match) => (
            <li key={match.id}>
              <Link href={`/events/${eventId}/matches/${match.id}`}>
                <Card className="hover:border-[var(--accent)] transition-colors cursor-pointer block">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {match.profile_summary ?? `Match ${match.id.slice(0, 8)}`}
                      </p>
                      {match.score != null && (
                        <p className="text-sm text-[var(--muted)]">Score: {match.score}</p>
                      )}
                    </div>
                    <span className="text-sm text-[var(--accent)]">View details →</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
