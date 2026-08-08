import type { Seat } from "../../types/seat";
import { SeatButton } from "./SeatButton";
import { getSeatLabel } from "../../utils/seat.utils";

export function SeatGrid(seats: Seat[]) {
  return `
    <div class="seat-grid">
      ${seats
        .map((seat, index) =>
          SeatButton(
            seat,
            getSeatLabel(index),
          ),
        )
        .join("")}
    </div>
  `;
}