import { apiRequest } from './api-client';

export type AppMe = {
  user_id: string;
  clerk_user_id: string | null;
  email: string | null;
  name: string | null;
  role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  avatar_url: string | null;
};

export async function fetchMe(token: string) {
  return apiRequest<AppMe>('/me', { token });
}
