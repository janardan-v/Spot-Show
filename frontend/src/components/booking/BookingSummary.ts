import type { Seat } from "../../types/seat";
import { getSelectedSeatIds } from "../../store/booking.store";
import { getSeatLabel } from "../../utils/seat.utils";
import { calculateTotalPrice } from "../../utils/booking.utils";

export function BookingSummary(seats: Seat[]) {
  const selectedSeatIds = getSelectedSeatIds();
  const selectedSeats = seats.filter((seat) => selectedSeatIds.has(seat.id));
  const totalPrice = calculateTotalPrice(selectedSeats.length);

  return `
    <aside class="booking-summary" aria-live="polite">
      <p class="eyebrow">Your selection</p>
      <h2 class="booking-summary__title">Summary</h2>

      <div class="booking-summary__seats">
        ${
          selectedSeats.length === 0
            ? `<p class="booking-summary__empty">No seats selected yet. Tap an available seat.</p>`
            : selectedSeats
                .map((seat) => {
                  const index = seats.indexOf(seat);
                  return `<span class="booking-summary__seat">${getSeatLabel(index)}</span>`;
                })
                .join("")
        }
      </div>

      <dl class="booking-summary__rows">
        <div>
          <dt>Seats</dt>
          <dd>${selectedSeats.length} selected</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd class="booking-summary__total">₹${totalPrice}</dd>
        </div>
      </dl>

      <button
        class="booking-summary__button"
        type="button"
        data-action="proceed-booking"
        ${selectedSeats.length === 0 ? "disabled" : ""}
      >
        Proceed to booking
      </button>
      <p class="booking-summary__hint">You can review before paying.</p>
    </aside>
  `;
}
