const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },

    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}