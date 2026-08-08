export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  BOOKING: "/booking",
  SHOW: "/shows",
} as const;

export type Route =
  (typeof ROUTES)[keyof typeof ROUTES];