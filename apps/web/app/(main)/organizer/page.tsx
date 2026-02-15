'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createEvent } from '@/lib/organizer-api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

export default function OrganizerDashboardPage() {
  const { accessToken, user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [rsvpDeadline, setRsvpDeadline] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ eventId: string; joinCode: string } | null>(null);

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  if (!isOrganizer) {
    return (
      <Card>
        <p className="text-[var(--muted)]">You need organizer or admin role to access this page.</p>
      </Card>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    const { data, error: err } = await createEvent(accessToken, {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      rsvp_deadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : null,
      capacity: capacity ? parseInt(capacity, 10) : null,
    });
    setLoading(false);
    if (err) {
      setError(typeof err.detail === 'string' ? err.detail : (err.detail as { message?: string })?.message ?? 'Failed to create event');
      return;
    }
    if (data) {
      setCreated({ eventId: data.event_id, joinCode: data.join_code });
      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');
      setEndsAt('');
      setRsvpDeadline('');
      setCapacity('');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Organizer dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create and manage events. Events start as draft; publish when ready. You can close registration or cancel an event.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create event</CardTitle>
          <CardDescription>
            New events are created in draft. After creating, open the event and use Publish to make it visible and open for RSVPs.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Description (optional)</label>
            <textarea
              className="input-base min-h-[100px]"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Input
            label="Location (optional)"
            placeholder="Venue or address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Starts at (optional, ISO/local)"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <Input
              label="Ends at (optional)"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>
          <Input
            label="RSVP deadline (optional)"
            type="datetime-local"
            value={rsvpDeadline}
            onChange={(e) => setRsvpDeadline(e.target.value)}
            hint="Must be before event start. Registration allowed while now &lt; deadline."
          />
          <Input
            label="Capacity (optional)"
            type="number"
            min={1}
            placeholder="Max attendees"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          {error && (
            <p className="text-sm text-[var(--destructive)]" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading}>
            Create event (draft)
          </Button>
        </form>
        {created && (
          <div className="mt-4 p-4 rounded-lg bg-[var(--success-bg)] text-[var(--success)]">
            <p className="font-medium">Event created.</p>
            <p className="text-sm mt-1">Join code: <code className="bg-black/10 px-1 rounded">{created.joinCode}</code></p>
            <Link href={`/events/${created.eventId}`} className="link text-sm mt-2 inline-block">
              Open event →
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your events</CardTitle>
          <CardDescription>
            Manage draft, published, and closed events. Listing your events by organizer requires a backend endpoint (e.g. GET /events?organizer=me). For now, open an event via its link after creating, or from the Events list if it’s published.
          </CardDescription>
        </CardHeader>
        <Link href="/events">
          <Button variant="secondary">Browse all events</Button>
        </Link>
      </Card>
    </div>
  );
}
