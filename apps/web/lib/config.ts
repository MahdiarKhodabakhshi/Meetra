/**
 * Runtime config for the web app.
 *
 * In the browser, API calls are proxied through Next.js rewrites
 * (see next.config.ts) so they go through port 3000 — avoiding
 * firewall / CORS issues with direct cross-port requests.
 *
 * On the server (SSR), we call the backends directly.
 */
const isBrowser = typeof window !== 'undefined';

export const API_BASE = isBrowser ? '/proxy/api' : (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '');

export const AUTH_API_BASE = isBrowser ? '/proxy/auth' : (process.env.NEXT_PUBLIC_AUTH_API_URL?.replace(/\/$/, '') || API_BASE);

/** API prefix — the proxy rewrites already include /v1, so skip it in browser */
export const API_PREFIX = isBrowser ? '' : '/v1';
