import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../store/auth.store";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",

      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),

      ...options.headers,
    },

    ...options,
  });

  if (response.status === 401 && retry) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      throw new Error("Authentication required");
    }

    try {
      const refreshResponse = await fetch(
        `${BASE_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
          }),
        },
      );

      if (!refreshResponse.ok) {
        clearTokens();
        throw new Error("Session expired");
      }

      const refreshData =
        await refreshResponse.json();

      setTokens(
        refreshData.accessToken,
        refreshToken,
      );

      return request<T>(
        endpoint,
        options,
        false,
      );
    } catch (error) {
      clearTokens();
      throw error;
    }
  }

  if (!response.ok) {
  const errorData = await response.json().catch(() => null);


  throw new Error(
    errorData?.message ??
      `Request failed with status ${response.status}`,
  );
}

  return response.json() as Promise<T>;
}