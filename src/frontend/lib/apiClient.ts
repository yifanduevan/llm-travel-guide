const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${path}`);
  }
  return res.json() as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`${res.status} ${path}`);
  }
  return res.json() as T;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, 'method' | 'body'>,
): Promise<T> {
  return requestJson<T>(path, {
    ...(init ?? {}),
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, 'method' | 'body'>,
): Promise<T> {
  return requestJson<T>(path, {
    ...(init ?? {}),
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function apiDelete(
  path: string,
  init?: Omit<RequestInit, 'method'>,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...(init ?? {}),
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${path}`);
  }
}
