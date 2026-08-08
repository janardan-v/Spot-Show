export interface Seat {
  id: string;
  isBooked: boolean;
  showId: string;
  bookedBY: string | null;
}