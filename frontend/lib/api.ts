export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
) {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(', ')
          : 'Something went wrong';

    throw new Error(message);
  }

  return data;
}
