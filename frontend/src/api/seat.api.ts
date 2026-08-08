import { request } from "./client";
import type { Seat } from "../types/seat";

interface GetSeatsResponse {
  showSeatResult: Seat[];
}

export function getSeats(showId: string) {
  return request<GetSeatsResponse>(`/shows/seats/${showId}`);
}