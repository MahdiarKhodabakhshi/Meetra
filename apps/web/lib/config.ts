/**
 * Runtime config for the web app. API base URL (no trailing slash).
 * Set NEXT_PUBLIC_API_URL in .env (e.g. http://localhost:9000) for local API.
 */
export const API_BASE =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : '';

/**
 * Auth service base URL. If not set, falls back to API_BASE.
 * Set NEXT_PUBLIC_AUTH_API_URL for microservices mode (e.g. http://localhost:8002).
 */
export const AUTH_API_BASE =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_API_URL
    ? process.env.NEXT_PUBLIC_AUTH_API_URL.replace(/\/$/, '')
    : API_BASE;

/** API prefix; backend mounts v1 at /v1 */
export const API_PREFIX = '/v1';
