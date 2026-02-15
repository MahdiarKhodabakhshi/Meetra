'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  listAdminUsers,
  updateAdminUser,
  revokeUserSessions,
  type UpdateUserIn,
} from '@/lib/admin-api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import type { AdminUserOut } from '@/lib/types';

export default function AdminDashboardPage() {
  const { accessToken, user } = useAuth();
  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    return (
      <Card>
        <p className="text-[var(--muted)]">You need admin role to access this page.</p>
      </Card>
    );
  }

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    listAdminUsers(accessToken, { query: query.trim() || undefined, limit: 100 })
      .then(({ data, error: err }) => {
        if (err) setError(typeof err.detail === 'string' ? err.detail : 'Failed to load users');
        else setUsers(data ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [accessToken]);

  const handleUpdate = async (userId: string, payload: UpdateUserIn) => {
    if (!accessToken || userId === user?.user_id) return;
    setUpdatingId(userId);
    setActionError(null);
    const { error: err } = await updateAdminUser(accessToken, userId, payload);
    setUpdatingId(null);
    if (err) {
      setActionError(
        typeof err.detail === 'string'
          ? err.detail
          : ((err.detail as { message?: string })?.message ?? 'Update failed'),
      );
      return;
    }
    load();
  };

  const handleRevokeSessions = async (userId: string) => {
    if (!accessToken || !confirm('Revoke all sessions for this user?')) return;
    setUpdatingId(userId);
    setActionError(null);
    const { error: err } = await revokeUserSessions(accessToken, userId);
    setUpdatingId(null);
    if (err) {
      setActionError(typeof err.detail === 'string' ? err.detail : 'Revoke failed');
      return;
    }
    load();
  };

  return (
    <div className="space-y-8">
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
            inactive, suspended). You cannot change your own role.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3 mb-4">
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
          <p className="text-sm text-[var(--destructive)] mb-2" role="alert">
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
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Name</th>
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Last login</th>
                  <th className="text-left py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-[var(--border)]">
                    <td className="py-2">{u.email ?? '—'}</td>
                    <td className="py-2">{u.name ?? '—'}</td>
                    <td className="py-2">
                      <select
                        className="input-base py-1 text-sm max-w-[120px]"
                        value={u.role}
                        disabled={u.user_id === user?.user_id}
                        onChange={(e) =>
                          handleUpdate(u.user_id, {
                            role: e.target.value as 'attendee' | 'organizer' | 'admin',
                          })
                        }
                      >
                        <option value="attendee">attendee</option>
                        <option value="organizer">organizer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        className="input-base py-1 text-sm max-w-[120px]"
                        value={u.status}
                        disabled={u.user_id === user?.user_id}
                        onChange={(e) =>
                          handleUpdate(u.user_id, {
                            status: e.target.value as 'active' | 'inactive' | 'suspended',
                          })
                        }
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="suspended">suspended</option>
                      </select>
                    </td>
                    <td className="py-2 text-[var(--muted)]">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-2">
                      {u.user_id !== user?.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSessions(u.user_id)}
                          disabled={!!updatingId}
                        >
                          Revoke sessions
                        </Button>
                      )}
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
            Event-level moderation (e.g. hide or feature events) can be added when the backend
            exposes admin event endpoints.
          </CardDescription>
        </CardHeader>
        <p className="text-sm text-[var(--muted)]">
          For now, use the Events list and event detail; admins can open any event and organizers
          can cancel their own.
        </p>
      </Card>
    </div>
  );
}
