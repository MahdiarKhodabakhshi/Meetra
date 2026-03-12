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
  join_code: string;
  is_hidden: boolean;
  is_featured: boolean;
  moderation_note: string | null;
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

/** Resume pipeline state for Profile + upload UI (legacy; prefer ResumeVersionStatus) */
export type ResumeState = 'uploaded' | 'scanned' | 'parsed' | 'failed';

/** Resume version status from backend */
export type ResumeVersionStatus =
  | 'UPLOADED'
  | 'SCANNING'
  | 'PARSING'
  | 'PARSED'
  | 'FAILED';

export interface ResumeVersionOut {
  id: string;
  user_id: string;
  file_uri: string;
  original_filename: string;
  mime_type: string;
  sha256: string;
  status: ResumeVersionStatus;
  error_code: string | null;
  error_message: string | null;
  parsed_at: string | null;
  extracted_text_uri: string | null;
  created_at: string;
}

export interface ResumeStatusOut {
  id: string;
  status: ResumeVersionStatus;
  error_code: string | null;
  error_message: string | null;
  parsed_at: string | null;
  progress_stage: string;
}

/** Profile from GET /profiles/me */
export interface ProfileOut {
  user_id: string;
  headline: string | null;
  summary: string | null;
  skills: string[];
  titles: string[];
  industries: string[];
  confidence_json: ConfidenceJson;
  source_resume_id: string | null;
  updated_at: string;
}

/** Per-field confidence: value 0–1, source e.g. USER_CONFIRMED or parser */
export interface FieldConfidence {
  value: number;
  source: string;
}

export interface ConfidenceJson {
  manual_overrides?: string[];
  headline?: FieldConfidence;
  summary?: FieldConfidence;
  skills?: FieldConfidence;
  titles?: FieldConfidence;
  industries?: FieldConfidence;
  [key: string]: unknown;
}

/** Payload for PUT /profiles/me (patch-like; only send changed fields) */
export interface ProfileUpdatePayload {
  headline?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  titles?: string[] | null;
  industries?: string[] | null;
}

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

/** Admin user list item (auth-service; name lives in core profile, often omitted) */
export interface AdminUserOut {
  user_id: string;
  email: string | null;
  name?: string | null;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
}
