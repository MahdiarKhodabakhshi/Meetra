import { apiRequest } from './api-client';
import type { Event } from './types';

export interface EventCreatePayload {
  title: string;
  description?: string | null;
  location?: string | null;
  starts_at?: string | null; // ISO with timezone
  ends_at?: string | null;
  rsvp_deadline?: string | null;
  capacity?: number | null;
}

export interface EventUpdatePayload {
  title?: string;
  description?: string | null;
  location?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  rsvp_deadline?: string | null;
  capacity?: number | null;
}

export interface EventCreatedOut {
  event_id: string;
  join_code: string;
}

export async function createEvent(token: string | null, payload: EventCreatePayload) {
  return apiRequest<EventCreatedOut>('/events', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(
  token: string | null,
  eventId: string,
  payload: EventUpdatePayload,
) {
  return apiRequest<Event>(`/events/${eventId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function publishEvent(token: string | null, eventId: string) {
  return apiRequest<Event>(`/events/${eventId}/publish`, {
    method: 'POST',
    token,
  });
}

export async function cancelEvent(token: string | null, eventId: string) {
  return apiRequest<Event>(`/events/${eventId}/cancel`, {
    method: 'POST',
    token,
  });
}
