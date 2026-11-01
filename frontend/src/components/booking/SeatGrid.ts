import type { Seat } from "../../types/seat";
import { SeatButton } from "./SeatButton";
import { getSeatLabel } from "../../utils/seat.utils";

export function SeatGrid(seats: Seat[]) {
  if (!seats.length) {
    return `
      <div class="empty-state" role="status">
        No auditorium seats mapped for this screening.
      </div>
    `;
  }

  const booked = seats.filter((s) => s.isBooked).length;
  const available = seats.length - booked;

  return `
    <div class="seat-grid__status-bar">
      <span class="seat-grid__available-badge">${available} SEATS AVAILABLE</span>
      <span class="seat-grid__capacity">${seats.length} TOTAL AUDITORIUM CAPACITY</span>
    </div>

    <div class="seat-map">
      <div class="seat-map__screen" aria-hidden="true">
        <div class="seat-map__screen-beam"></div>
        <span class="seat-map__screen-bar"></span>
        <span class="seat-map__screen-label">CURVED THEATRICAL SCREEN // 70MM PROJECTION</span>
      </div>

      <div
        class="seat-map__viewport"
        role="group"
        aria-label="Auditorium seat map"
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
