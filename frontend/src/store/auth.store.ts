
const ACCESS_TOKEN_KEY = "spotshow_access_token";
const REFRESH_TOKEN_KEY = "spotshow_refresh_token";

let accessToken: string | null =
  localStorage.getItem(ACCESS_TOKEN_KEY);

let refreshToken: string | null =
  localStorage.getItem(REFRESH_TOKEN_KEY);

export function setTokens(
  newAccessToken: string,
  newRefreshToken: string,
) {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    newAccessToken,
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    newRefreshToken,
  );
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated() {
  return accessToken !== null;
}