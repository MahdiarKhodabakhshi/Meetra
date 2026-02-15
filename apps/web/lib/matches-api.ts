import { apiRequest } from './api-client';
import type { Match } from './types';

/**
 * MVP: Matches API may not exist yet (P6 in system design).
 * Placeholder responses until backend implements GET /events/:id/matches and GET /events/:id/matches/:matchId
 */
export async function fetchMatchesForEvent(
  _token: string | null,
  eventId: string,
): Promise<{ data?: Match[]; error?: { detail: unknown; statusCode: number } }> {
  const { data, error } = await apiRequest<Match[]>(`/events/${eventId}/matches`, {
    token: _token,
  });
  if (error && error.statusCode !== 404) return { error };
  if (data) return { data };
  return { data: [] };
}

export async function fetchMatchDetail(
  _token: string | null,
  eventId: string,
  matchId: string,
): Promise<{
  data?: Match & { profile_summary?: string; strategy?: string; explanation?: string };
  error?: { detail: unknown; statusCode: number };
}> {
  const { data, error } = await apiRequest<Match & { profile_summary?: string; strategy?: string }>(
    `/events/${eventId}/matches/${matchId}`,
    { token: _token },
  );
  if (error && error.statusCode !== 404) return { error };
  return { data: data ?? undefined };
}
