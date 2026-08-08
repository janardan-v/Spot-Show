export const SEAT_PRICE = 200;

export function calculateTotalPrice(seatCount: number) {
  return seatCount * SEAT_PRICE;
}