import type { Seat } from "../../types/seat";
import { getSelectedSeatIds } from "../../store/booking.store";

export function SeatButton(seat: Seat, label: string) {
  const selected = getSelectedSeatIds().has(seat.id);

  const statusClass = seat.isBooked
    ? "seat--booked"
    : selected
      ? "seat--selected"
      : "seat--available";

  const label_text = seat.isBooked
    ? `${label}, occupied`
    : selected
      ? `${label}, selected`
      : `${label}, available`;

  return `
    <button
      class="seat ${statusClass}"
      data-seat-id="${seat.id}"
      ${seat.isBooked ? "disabled aria-disabled=\"true\"" : ""}
      ${selected && !seat.isBooked ? 'aria-pressed="true"' : 'aria-pressed="false"'}
      aria-label="Seat ${label_text}"
      type="button"
    >
      <span class="seat__label" aria-hidden="true">${label}</span>
    </button>
  `;
}
