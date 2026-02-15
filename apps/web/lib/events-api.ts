import { apiRequest } from './api-client';
import type { Event, EventListResponse, EventStatus, RSVPResponse } from './types';

export async function fetchEvents(
  token: string | null,
  params?: { page?: number; page_size?: number; starts_after?: string; starts_before?: string },
) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.page_size) sp.set('page_size', String(params.page_size));
  if (params?.starts_after) sp.set('starts_after', params.starts_after);
  if (params?.starts_before) sp.set('starts_before', params.starts_before);
  const q = sp.toString();
  return apiRequest<EventListResponse>(`/events${q ? `?${q}` : ''}`, { token });
}

export async function fetchEvent(token: string | null, eventId: string) {
  return apiRequest<Event>(`/events/${eventId}`, { token });
}

export async function rsvpEvent(token: string | null, eventId: string) {
  return apiRequest<RSVPResponse>(`/events/${eventId}/rsvp`, {
    method: 'POST',
    token,
  });
}

export async function cancelRsvp(token: string | null, eventId: string) {
  return apiRequest<unknown>(`/events/${eventId}/rsvp`, {
    method: 'DELETE',
    token,
  });
}

/** Registration allowed if published and (no deadline or now < deadline) */
export function isRegistrationOpen(event: {
  status: EventStatus;
  rsvp_deadline: string | null;
}): boolean {
  if (event.status !== 'published') return false;
  if (!event.rsvp_deadline) return true;
  return new Date(event.rsvp_deadline) > new Date();
}

export function formatEventDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
