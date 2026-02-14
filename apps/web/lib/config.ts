/**
 * Runtime config for the web app. API base URL (no trailing slash).
 * Set NEXT_PUBLIC_API_URL in .env (e.g. http://localhost:8000) for local API.
 */
export const API_BASE =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : '';

/** API prefix; backend mounts v1 at /v1 */
export const API_PREFIX = '/v1';
