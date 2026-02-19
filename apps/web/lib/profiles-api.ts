import { apiRequest } from './api-client';
import type { ProfileOut, ProfileUpdatePayload } from './types';

export async function getMyProfile(
  token: string | null,
): Promise<{ data?: ProfileOut; error?: { detail: unknown; statusCode: number } }> {
  return apiRequest<ProfileOut>('/profiles/me', { token });
}

export async function updateMyProfile(
  token: string | null,
  payload: ProfileUpdatePayload,
): Promise<{ data?: ProfileOut; error?: { detail: unknown; statusCode: number } }> {
  return apiRequest<ProfileOut>('/profiles/me', {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}
