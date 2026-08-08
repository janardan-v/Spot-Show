import type { Seat } from "../../types/seat";

export function SeatButton(
  seat: Seat,
  label: string,
) {
  const statusClass = seat.isBooked
    ? "seat--booked"
    : "seat--available";

  return `
    <button
      class="seat ${statusClass}"
      data-seat-id="${seat.id}"
      ${seat.isBooked ? "disabled" : ""}
      type="button"
    >
      <span class="seat__label">
        ${label}
      </span>
    </button>
  `;
}