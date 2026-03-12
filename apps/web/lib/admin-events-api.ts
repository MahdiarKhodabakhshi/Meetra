import { apiRequest } from './api-client';
import type { Event, EventListResponse } from './types';

export type EventModerationPatch = {
  is_hidden?: boolean;
  is_featured?: boolean;
  moderation_note?: string | null;
};

export async function listAdminEvents(
  token: string | null,
  params?: {
    page?: number;
    page_size?: number;
    status?: string;
    hidden?: boolean;
    featured?: boolean;
    q?: string;
  },
) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.page_size) sp.set('page_size', String(params.page_size));
  if (params?.status) sp.set('status', params.status);
  if (params?.hidden !== undefined) sp.set('hidden', String(params.hidden));
  if (params?.featured !== undefined) sp.set('featured', String(params.featured));
  if (params?.q?.trim()) sp.set('q', params.q.trim());
  const q = sp.toString();
  return apiRequest<EventListResponse>(`/admin/events${q ? `?${q}` : ''}`, { token });
}

export async function patchEventModeration(
  token: string | null,
  eventId: string,
  body: EventModerationPatch,
) {
  return apiRequest<Event>(`/admin/events/${eventId}/moderation`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}
