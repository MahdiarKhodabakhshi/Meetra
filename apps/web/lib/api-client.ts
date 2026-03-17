import { API_BASE, API_PREFIX, AUTH_API_BASE } from './config';

export type ApiError = {
  detail: unknown;
  statusCode: number;
};

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

function getBaseUrl(path: string): string {
  if (path.startsWith('/auth/')) {
    return AUTH_API_BASE;
  }
  return API_BASE;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<{ data?: T; error?: ApiError }> {
  const { token, ...init } = options;
  const baseUrl = getBaseUrl(path);
  const url = `${baseUrl}${API_PREFIX}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, credentials: 'include' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch';
    return {
      error: {
        detail: `Network error. Check API URL and CORS settings. (${message})`,
        statusCode: 0,
      },
    };
  }
  const data = await parseResponse<T>(res);
  if (!res.ok) {
    const detail =
      typeof data === 'object' && data && 'detail' in data
        ? (data as { detail: ApiError['detail'] }).detail
        : res.statusText;
    return {
      error: {
        detail: detail as ApiError['detail'],
        statusCode: res.status,
      },
    };
  }
  return { data: data as T };
}

export function getApiErrorMessage(error: ApiError): string {
  const d = error.detail;
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') {
    const maybe = d as { message?: unknown; code?: unknown };
    if (typeof maybe.message === 'string' && maybe.message) return maybe.message;
    if (typeof maybe.code === 'string' && maybe.code) return maybe.code;
  }
  return 'Something went wrong';
}

/** Multipart upload (e.g. file). Do not set Content-Type; browser sets it with boundary. */
export async function apiRequestMultipart<T>(
  path: string,
  body: FormData,
  options: { token?: string | null; method?: string } = {},
): Promise<{ data?: T; error?: ApiError }> {
  const { token, method = 'POST' } = options;
  const url = `${API_BASE}${API_PREFIX}${path}`;
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      credentials: 'include',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch';
    return {
      error: {
        detail: `Network error. (${message})`,
        statusCode: 0,
      },
    };
  }
  const data = await parseResponse<T>(res);
  if (!res.ok) {
    const detail =
      typeof data === 'object' && data && 'detail' in data
        ? (data as { detail: ApiError['detail'] }).detail
        : res.statusText;
    return {
      error: {
        detail: detail as ApiError['detail'],
        statusCode: res.status,
      },
    };
  }
  return { data: data as T };
}
