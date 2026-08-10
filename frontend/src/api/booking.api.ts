import { request } from "./client";

export interface BookSeatResponse {
  message: string;
}

export function bookSeat(seatId: string) {
  return request<BookSeatResponse>(
    `/shows/book/${seatId}`,
    {
      method: "POST",
    },
  );
}