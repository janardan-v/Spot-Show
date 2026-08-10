export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  BOOKING: "/booking",
  SHOW: "/shows",
  ACCOUNT: "/account",
} as const;

export type Route =
  (typeof ROUTES)[keyof typeof ROUTES];