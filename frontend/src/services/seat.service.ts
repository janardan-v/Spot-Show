import { getSeats } from "../api/seat.api";

export async function fetchSeats(showId: string) {
  const response = await getSeats(showId);

  return response.showSeatResult;
}