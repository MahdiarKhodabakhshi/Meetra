'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAppMe } from '@/lib/use-app-me';
import {
  listAdminUsers,
  updateAdminUser,
  revokeUserSessions,
  type UpdateUserIn,
} from '@/lib/admin-api';
import {
  listAdminEvents,
  patchEventModeration,
  type EventModerationPatch,
} from '@/lib/admin-events-api';
import { getApiErrorMessage } from '@/lib/api-client';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import type { AdminUserOut, Event } from '@/lib/types';

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const { me, loading: meLoading } = useAppMe();

  const role = me?.role?.toLowerCase();
  const isAdmin = role === 'admin';

  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventQuery, setEventQuery] = useState('');
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);

    const { data, error } = await listAdminUsers(token, {
      query: query.trim() || undefined,
      limit: 100,
    });

    if (error) {
      setActionError(getApiErrorMessage(error));
    } else {
      setUsers(data ?? []);
    }

    setLoading(false);
  }, [getToken, query]);

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin, load]);

  const loadEvents = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    setEventsLoading(true);

    const { data, error } = await listAdminEvents(token, {
      page_size: 100,
      q: eventQuery.trim() || undefined,
    });

    if (error) {
      setActionError(getApiErrorMessage(error));
    } else if (data) {
      setEvents(data.items ?? []);
    }

    setEventsLoading(false);
  }, [getToken, eventQuery]);

  useEffect(() => {
    if (!isAdmin) return;
    loadEvents();
  }, [isAdmin, loadEvents]);

  const handleUpdate = async (userId: string, payload: UpdateUserIn) => {
    const token = await getToken();
    if (!token) return;

    setUpdatingId(userId);
    setActionError(null);

    const { error: err } = await updateAdminUser(token, userId, payload);

    setUpdatingId(null);

    if (err) {
      setActionError(
        typeof err.detail === 'string'
          ? err.detail
          : ((err.detail as { message?: string })?.message ?? 'Update failed'),
      );
      return;
    }

    await load();
  };

  const handleEventModeration = async (eventId: string, patch: EventModerationPatch) => {
    const token = await getToken();
    if (!token) return;

    setUpdatingEventId(eventId);
    setActionError(null);

    const { error: err } = await patchEventModeration(token, eventId, patch);

    setUpdatingEventId(null);

    if (err) {
      setActionError(getApiErrorMessage(err));
      return;
    }

    await loadEvents();
  };

  const handleRevokeSessions = async (userId: string) => {
    const token = await getToken();
    if (!token || !confirm('Revoke all sessions for this user?')) return;

    setUpdatingId(userId);
    setActionError(null);

    const { error: err } = await revokeUserSessions(token, userId);

    setUpdatingId(null);

    if (err) {
      setActionError(typeof err.detail === 'string' ? err.detail : 'Revoke failed');
      return;
    }

    await load();
  };

  if (meLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <p className="text-[var(--muted)]">You need admin role to access this page.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* SAME UI — unchanged */}
      {/* (no need to touch rest of file) */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Admin dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Moderate users: view list, change role/status, revoke sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Search by email or name. Change role (attendee, organizer, admin) or status (active,
            inactive, suspended). Self-edit protection will be restored when real roles/user mapping
            is wired.
          </CardDescription>
        </CardHeader>

        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search email or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="secondary" onClick={load} disabled={loading}>
            Search
          </Button>
        </div>

        {actionError && (
          <p className="mb-2 text-sm text-[var(--destructive)]" role="alert">
            {actionError}
          </p>
        )}

        {loading && users.length === 0 ? (
          <div className="flex justify-center py-8">
            <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-2 text-left font-medium">Email</th>
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Role</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-left font-medium">Last login</th>
                  <th className="py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-[var(--border)]">
                    <td className="py-2">{u.email ?? '—'}</td>
                    <td className="py-2">{u.name ?? '—'}</td>
                    <td className="py-2">
                      <select
                        className="input-base max-w-[120px] py-1 text-sm"
                        value={u.role}
                        onChange={(e) =>
                          handleUpdate(u.user_id, {
                            role: e.target.value as 'ATTENDEE' | 'ORGANIZER' | 'ADMIN',
                          })
                        }
                      >
                        <option value="ATTENDEE">attendee</option>
                        <option value="ORGANIZER">organizer</option>
                        <option value="ADMIN">admin</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        className="input-base max-w-[120px] py-1 text-sm"
                        value={u.status}
                        onChange={(e) =>
                          handleUpdate(u.user_id, {
                            status: e.target.value as 'ACTIVE' | 'SUSPENDED' | 'DELETED',
                          })
                        }
                      >
                        <option value="ACTIVE">active</option>
                        <option value="SUSPENDED">suspended</option>
                        <option value="DELETED">deleted</option>
                      </select>
                    </td>
                    <td className="py-2 text-[var(--muted)]">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSessions(u.user_id)}
                        disabled={!!updatingId}
                      >
                        Revoke sessions
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events moderation</CardTitle>
          <CardDescription>
            Hide events from the public catalog and feature highlighted events.
          </CardDescription>
        </CardHeader>

        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search title"
            value={eventQuery}
            onChange={(e) => setEventQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="secondary" onClick={loadEvents} disabled={eventsLoading}>
            Search
          </Button>
        </div>

        {eventsLoading && events.length === 0 ? (
          <div className="flex justify-center py-8">
            <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Hidden</th>
                  <th className="py-2 pr-4">Featured</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b border-[var(--border)]/60">
                    <td className="max-w-[200px] py-2 pr-4">
                      <span className="font-medium">{ev.title}</span>
                      {ev.moderation_note && (
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                          Note: {ev.moderation_note}
                        </p>
                      )}
                    </td>
                    <td className="py-2 pr-4">{ev.status}</td>
                    <td className="py-2 pr-4">{ev.is_hidden ? 'yes' : 'no'}</td>
                    <td className="py-2 pr-4">{ev.is_featured ? 'yes' : 'no'}</td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={updatingEventId === ev.id}
                          onClick={() => handleEventModeration(ev.id, { is_hidden: !ev.is_hidden })}
                        >
                          {ev.is_hidden ? 'Unhide' : 'Hide'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={updatingEventId === ev.id}
                          onClick={() =>
                            handleEventModeration(ev.id, { is_featured: !ev.is_featured })
                          }
                        >
                          {ev.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
