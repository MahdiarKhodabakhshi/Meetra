'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  fetchEvent,
  rsvpEvent,
  cancelRsvp,
  isRegistrationOpen,
  formatEventDate,
} from '@/lib/events-api';
import { publishEvent, cancelEvent } from '@/lib/organizer-api';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import type { Event } from '@/lib/types';

export default function EventDetailPage() {
  const params = useParams();
  const { accessToken, user } = useAuth();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'joined' | 'already_joined' | 'cancelled' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOrganizer = user && (user.role === 'organizer' || user.role === 'admin') && event?.organizer_id === user.user_id;

  useEffect(() => {
    if (!accessToken || !eventId) return;
    setLoading(true);
    fetchEvent(accessToken, eventId)
      .then(({ data, error: err }) => {
        if (err) setError(err.detail?.message ?? 'Event not found');
        else setEvent(data ?? null);
      })
      .finally(() => setLoading(false));
  }, [accessToken, eventId]);

  const registrationOpen = event ? isRegistrationOpen(event) : false;

  const handleRsvp = async () => {
    if (!accessToken || !eventId) return;
    setActionError(null);
    setActionLoading(true);
    const { data, error: err } = await rsvpEvent(accessToken, eventId);
    setActionLoading(false);
    if (err) {
      const msg = typeof err.detail === 'object' && err.detail?.message ? err.detail.message : String(err.detail);
      setActionError(msg);
      return;
    }
    if (data) setRsvpStatus(data.status as 'joined' | 'already_joined');
  };

  const handleCancelRsvp = async () => {
    if (!accessToken || !eventId) return;
    setActionError(null);
    setActionLoading(true);
    const { error: err } = await cancelRsvp(accessToken, eventId);
    setActionLoading(false);
    if (err) {
      setActionError(typeof err.detail === 'string' ? err.detail : 'Failed to cancel');
      return;
    }
    setRsvpStatus('cancelled');
  };

  const handlePublish = async () => {
    if (!accessToken || !eventId) return;
    setActionError(null);
    setActionLoading(true);
    const { data, error: err } = await publishEvent(accessToken, eventId);
    setActionLoading(false);
    if (err) {
      setActionError(typeof err.detail === 'string' ? err.detail : (err.detail as { message?: string })?.message ?? 'Failed to publish');
      return;
    }
    if (data) setEvent(data);
  };

  const handleCancelEvent = async () => {
    if (!accessToken || !eventId || !confirm('Cancel this event? Registration will be closed.')) return;
    setActionError(null);
    setActionLoading(true);
    const { data, error: err } = await cancelEvent(accessToken, eventId);
    setActionLoading(false);
    if (err) {
      setActionError(typeof err.detail === 'string' ? err.detail : 'Failed to cancel event');
      return;
    }
    if (data) setEvent(data);
  };

  if (loading && !event) {
    return (
      <div className="flex justify-center py-12">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link href="/events" className="link text-sm">← Back to events</Link>
        <Card>
          <p className="text-[var(--destructive)]">{error ?? 'Event not found.'}</p>
        </Card>
      </div>
    );
  }

  const isJoined = rsvpStatus === 'joined' || rsvpStatus === 'already_joined';
  const isCancelled = rsvpStatus === 'cancelled';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/events" className="link text-sm">← Events</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium truncate">{event.title}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{event.title}</h1>
          <p className="text-[var(--muted)] mt-1">
            {formatEventDate(event.starts_at)}
            {event.ends_at && ` – ${formatEventDate(event.ends_at)}`}
          </p>
          <div className="mt-2">
            <Badge status={event.status as 'draft' | 'published' | 'closed' | 'cancelled'}>
              {event.status}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOrganizer && (
            <>
              {event.status === 'draft' && (
                <Button onClick={handlePublish} loading={actionLoading}>
                  Publish event
                </Button>
              )}
              {(event.status === 'published' || event.status === 'closed') && (
                <Button variant="danger" onClick={handleCancelEvent} loading={actionLoading}>
                  Cancel event
                </Button>
              )}
            </>
          )}
          {registrationOpen && !isJoined && !isCancelled && (
            <Button onClick={handleRsvp} loading={actionLoading}>
              RSVP
            </Button>
          )}
          {isJoined && (
            <>
              <Badge status="joined">You&apos;re going</Badge>
              <Button variant="secondary" onClick={handleCancelRsvp} loading={actionLoading}>
                Cancel RSVP
              </Button>
              <Link href={`/events/${eventId}/matches`}>
                <Button variant="primary">My matches</Button>
              </Link>
            </>
          )}
          {isCancelled && registrationOpen && (
            <Button onClick={handleRsvp} loading={actionLoading}>
              Re-register
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <p className="text-sm text-[var(--destructive)]" role="alert">
          {actionError}
        </p>
      )}

      {!registrationOpen && event.status === 'published' && (
        <p className="text-sm text-[var(--muted)]">
          Registration is closed (deadline passed or event closed).
        </p>
      )}

      <Card>
        {event.description && (
          <div className="mb-4">
            <h2 className="text-sm font-medium text-[var(--muted)] mb-1">Description</h2>
            <p className="text-[var(--foreground)] whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
        {event.location && (
          <div className="mb-4">
            <h2 className="text-sm font-medium text-[var(--muted)] mb-1">Location</h2>
            <p>{event.location}</p>
          </div>
        )}
        {event.rsvp_deadline && (
          <div>
            <h2 className="text-sm font-medium text-[var(--muted)] mb-1">RSVP deadline</h2>
            <p>{formatEventDate(event.rsvp_deadline)}</p>
          </div>
        )}
      </Card>

      {isJoined && (
        <Card>
          <CardHeader>
            <CardTitle>Matches</CardTitle>
            <CardDescription>
              See who you’re matched with for this event and get approach suggestions.
            </CardDescription>
          </CardHeader>
          <Link href={`/events/${eventId}/matches`}>
            <Button variant="primary">View my matches</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
