import { apiRequest } from './api-client';
import type { AdminUserOut } from './types';

export async function listAdminUsers(
  token: string | null,
  params?: { query?: string; limit?: number }
) {
  const sp = new URLSearchParams();
  if (params?.query) sp.set('query', params.query);
  if (params?.limit) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiRequest<AdminUserOut[]>(`/admin/users${q ? `?${q}` : ''}`, { token });
}

export interface UpdateUserIn {
  role?: 'attendee' | 'organizer' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
}

export async function updateAdminUser(
  token: string | null,
  userId: string,
  payload: UpdateUserIn
) {
  return apiRequest<AdminUserOut>(`/admin/users/${userId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function revokeUserSessions(token: string | null, userId: string) {
  return apiRequest<{ revoked: number }>(`/admin/users/${userId}/revoke-sessions`, {
    method: 'POST',
    token,
  });
}
