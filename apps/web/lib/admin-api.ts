import { apiRequest } from './api-client';
import type { AdminUserOut } from './types';

/** Paths start with /auth/ so requests go to NEXT_PUBLIC_AUTH_API_URL (auth microservice). */
const BASE = '/auth/admin/users';

export async function listAdminUsers(
  token: string | null,
  params?: { query?: string; limit?: number },
) {
  const sp = new URLSearchParams();
  if (params?.query) sp.set('q', params.query);
  if (params?.limit) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiRequest<AdminUserOut[]>(`${BASE}${q ? `?${q}` : ''}`, { token });
}

export interface UpdateUserIn {
  role?: 'attendee' | 'organizer' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
}

export async function updateAdminUser(token: string | null, userId: string, payload: UpdateUserIn) {
  return apiRequest<AdminUserOut>(`${BASE}/${userId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function revokeUserSessions(token: string | null, userId: string) {
  return apiRequest<{ status: string; revoked_count: number }>(`${BASE}/${userId}/revoke-sessions`, {
    method: 'POST',
    token,
  });
}
