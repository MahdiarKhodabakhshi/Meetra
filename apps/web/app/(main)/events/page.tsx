'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchEvents } from '@/lib/events-api';
import { formatEventDate } from '@/lib/events-api';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import type { Event } from '@/lib/types';

export default function EventsListPage() {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    fetchEvents(accessToken, { page, page_size: 20 })
      .then(({ data, error }) => {
        if (error) setError(error.detail?.message ?? 'Failed to load events');
        else if (data) {
          setEvents(data.items);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken, page]);

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Events</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Choose an event to view details and your matches (event-first).
          </p>
        </div>
      </div>

      {error && (
        <div className="card border-[var(--destructive)] p-4 text-[var(--destructive)]">
          {error}
        </div>
      )}

      {!error && events.length === 0 && (
        <Card>
          <p className="text-center text-[var(--muted)] py-8">No published events yet.</p>
        </Card>
      )}

      {!error && events.length > 0 && (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id}>
              <Link href={`/events/${event.id}`}>
                <Card className="hover:border-[var(--accent)] transition-colors cursor-pointer block">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-[var(--foreground)]">{event.title}</h2>
                      <p className="text-sm text-[var(--muted)] mt-1">
                        {formatEventDate(event.starts_at)}
                        {event.location && ` · ${event.location}`}
                      </p>
                      {event.description && (
                        <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <Badge status={event.status as 'draft' | 'published' | 'closed' | 'cancelled'}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-3">
                    {event.capacity != null ? `Capacity ${event.capacity}` : 'No capacity limit'} · View details &amp; RSVP
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-[var(--muted)]">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="secondary"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
