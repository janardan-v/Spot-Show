import { request } from "./client";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export function login(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
}

export function getProfile() {
  return request<ProfileResponse>("/auth/profile");
}

export interface RegisterResponse {
  id: string;
  email: string;
}

export function register(
  name: string,
  email: string,
  age: number,
  password: string,
) {
  return request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      age,
      password,
    }),
  });
}
export function logout() {
  return request("/auth/logout", {
    method: "POST",
  });
}