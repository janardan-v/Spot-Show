import type { Seat } from "../../types/seat";
import { SeatButton } from "./SeatButton";
import { getSeatLabel } from "../../utils/seat.utils";

export function SeatGrid(seats: Seat[]) {
  if (!seats.length) {
    return `
      <div class="empty-state" role="status">
        No seats found for this show.
      </div>
    `;
  }

  const booked = seats.filter((s) => s.isBooked).length;

  return `
    <p class="seat-grid__meta" role="status">
      ${seats.length - booked} of ${seats.length} available
    </p>
    <div class="seat-map">
      <div class="seat-map__screen" aria-hidden="true">
        <span class="seat-map__screen-label">Screen</span>
        <span class="seat-map__screen-bar"></span>
      </div>
      <div
        class="seat-map__viewport"
        role="group"
        aria-label="Seat map"
        tabindex="0"
      >
        <div class="seat-grid">
          ${seats
            .map((seat, index) => SeatButton(seat, getSeatLabel(index)))
            .join("")}
        </div>
      </div>
    </div>
  `;
}
