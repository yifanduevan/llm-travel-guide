const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`${res.status} ${path}`);
  }
  return res.json() as T;
}