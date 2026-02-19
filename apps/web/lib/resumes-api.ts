import { apiRequest, apiRequestMultipart } from './api-client';
import type { ResumeVersionOut, ResumeStatusOut } from './types';

export const POLL_INTERVAL_MS = 2500;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB, match backend default

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'] as const;

export function isAllowedFile(file: File): { ok: true } | { ok: false; reason: string } {
  const type = file.type?.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { ok: false, reason: 'Only PDF and DOCX files are allowed.' };
  }
  const name = (file.name || '').toLowerCase();
  const hasExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasExt) {
    return { ok: false, reason: 'File must have a .pdf or .docx extension.' };
  }
  if (file.size === 0) {
    return { ok: false, reason: 'File is empty.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: `File exceeds maximum size of ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.` };
  }
  return { ok: true };
}

export async function uploadResume(
  token: string | null,
  file: File,
): Promise<{ data?: ResumeVersionOut; error?: { detail: unknown; statusCode: number } }> {
  const form = new FormData();
  form.append('file', file);
  return apiRequestMultipart<ResumeVersionOut>('/resumes', form, { token });
}

export async function getResumeStatus(
  token: string | null,
  resumeId: string,
): Promise<{ data?: ResumeStatusOut; error?: { detail: unknown; statusCode: number } }> {
  return apiRequest<ResumeStatusOut>(`/resumes/${resumeId}`, { token });
}

export async function getLatestResume(
  token: string | null,
): Promise<{ data?: ResumeVersionOut; error?: { detail: unknown; statusCode: number } }> {
  return apiRequest<ResumeVersionOut>('/resumes/latest', { token });
}

export function pollResumeUntilDone(
  token: string | null,
  resumeId: string,
  onStatus: (status: ResumeStatusOut) => void,
): Promise<ResumeStatusOut> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      const { data, error } = await getResumeStatus(token, resumeId);
      if (error) {
        reject(new Error(typeof error.detail === 'object' && error.detail && 'message' in error.detail
          ? String((error.detail as { message?: string }).message)
          : 'Failed to get status'));
        return;
      }
      if (!data) {
        reject(new Error('No status data'));
        return;
      }
      onStatus(data);
      if (data.status === 'PARSED' || data.status === 'FAILED') {
        resolve(data);
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    poll();
  });
}

/** User-friendly message for resume error codes */
export function resumeErrorCodeMessage(code: string | null, fallback: string): string {
  const map: Record<string, string> = {
    INVALID_MIME_TYPE: 'Only PDF and DOCX files are allowed.',
    INVALID_FILE_EXTENSION: 'Only .pdf and .docx extensions are allowed.',
    FILE_TOO_LARGE: 'File is too large. Maximum size is 10 MB.',
    EMPTY_FILE: 'The uploaded file is empty.',
    RESUME_DUPLICATE: 'This resume was already uploaded. Your previous version is still active.',
    STORAGE_WRITE_FAILED: 'We couldn’t save your file. Please try again.',
    QUEUE_ERROR: 'Processing couldn’t be started. Please try again.',
    RESUME_NOT_FOUND: 'Resume not found.',
    FORBIDDEN: 'You don’t have access to this resume.',
  };
  return (code && map[code]) || fallback;
}
