import { API_BASE, API_PREFIX } from './config';

export type ApiError = {
  detail: string | { code?: string; message?: string };
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

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<{ data?: T; error?: ApiError }> {
  const { token, ...init } = options;
  const url = `${API_BASE}${API_PREFIX}${path}`;
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
  if (typeof error.detail === 'string') return error.detail;
  return error.detail?.message ?? error.detail?.code ?? 'Something went wrong';
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
