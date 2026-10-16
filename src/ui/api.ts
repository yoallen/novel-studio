// Talks to the local service. The per-launch token arrives once in the URL fragment and is kept
// for this window only; it is never written to disk or placed in a query string.

const KEY = 'novel-studio-token';
function readToken(): string {
  const m = location.hash.match(/[#&]t=([A-Za-z0-9]+)/);
  if (m) {
    try { sessionStorage.setItem(KEY, m[1]!); } catch { /* storage unavailable: keep in memory */ }
    history.replaceState(null, '', location.pathname + location.search);
    return m[1]!;
  }
  try { return sessionStorage.getItem(KEY) ?? ''; } catch { return ''; }
}
const token = readToken();

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public detail?: any) { super(message); }
}

async function call<T>(method: string, url: string, body?: unknown, opts: { keepalive?: boolean } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { 'x-studio-token': token, ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      keepalive: opts.keepalive,
    });
  } catch {
    throw new ApiError(0, 'offline', 'The writing service is not responding. Your text is still on screen; keep it open and it will save when the service is back.');
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? 'error', data?.message ?? 'Something went wrong.', data?.detail);
  return data as T;
}

export const api = {
  get: <T = any>(url: string) => call<T>('GET', url),
  post: <T = any>(url: string, body: unknown = {}) => call<T>('POST', url, body),
  put: <T = any>(url: string, body: unknown, opts?: { keepalive?: boolean }) => call<T>('PUT', url, body, opts),
  patch: <T = any>(url: string, body: unknown) => call<T>('PATCH', url, body),
  del: <T = any>(url: string) => call<T>('DELETE', url),
  hasToken: () => !!token,
  /** Fire-and-forget request that survives the window closing. */
  beacon: (url: string, body: unknown = {}) => { fetch(url, { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json', 'x-studio-token': token }, body: JSON.stringify(body) }).catch(() => {}); },
};
