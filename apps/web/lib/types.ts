/** Auth API response (register/login/refresh) */
export interface AuthUser {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string | null;
  name: string | null;
  role: string;
  status: string;
}

/** /auth/me or current user summary */
export interface MeUser {
  user_id: string;
  email: string | null;
  name: string | null;
  role: string;
  status: string;
}

export type UserRole = 'attendee' | 'organizer' | 'admin';

/** Event status from backend (event lifecycle) */
export type EventStatus = 'draft' | 'published' | 'closed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  rsvp_deadline: string | null;
  capacity: number | null;
  status: EventStatus;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
}

export interface EventListResponse {
  items: Event[];
  page: number;
  page_size: number;
  total: number;
}

/** RSVP status (attendee state) */
export type RSVPStatus = 'joined' | 'already_joined' | 'cancelled';

export interface RSVPResponse {
  status: RSVPStatus;
  event_id: string;
  user_id: string;
}

/** Resume pipeline state for Profile + upload UI */
export type ResumeState = 'uploaded' | 'scanned' | 'parsed' | 'failed';

/** Match (per event) - MVP shape; backend may add later */
export interface Match {
  id: string;
  event_id: string;
  user_id: string;
  score?: number;
  explanation?: string;
  strategy?: string;
  profile_summary?: string;
}

/** Admin user list item */
export interface AdminUserOut {
  user_id: string;
  email: string | null;
  name: string | null;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
}
