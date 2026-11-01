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
      <div class="booking-summary__ticket-head">
        <span class="booking-summary__stub-badge">ADMIT VOUCHER</span>
        <span class="booking-summary__stub-no">N° 2030-AUD-1</span>
      </div>

      <h2 class="booking-summary__title">RESERVATION SUMMARY</h2>

      <div class="booking-summary__seats">
        ${
          selectedSeats.length === 0
            ? `<p class="booking-summary__empty">No seats selected yet. Choose seats from the auditorium map.</p>`
            : selectedSeats
                .map((seat) => {
                  const index = seats.indexOf(seat);
                  return `<span class="booking-summary__seat">SEAT ${getSeatLabel(index)}</span>`;
                })
                .join("")
        }
      </div>

      <div class="booking-summary__perforation" aria-hidden="true">
        <span class="booking-summary__notch booking-summary__notch--left"></span>
        <span class="booking-summary__perf-line"></span>
        <span class="booking-summary__notch booking-summary__notch--right"></span>
      </div>

      <dl class="booking-summary__rows">
        <div>
          <dt>SELECTED SEATS</dt>
          <dd>${selectedSeats.length} PASS${selectedSeats.length === 1 ? "" : "ES"}</dd>
        </div>
        <div>
          <dt>ADMIT TARIFF</dt>
          <dd>₹200 / SEAT</dd>
        </div>
        <div class="booking-summary__total-row">
          <dt>TOTAL AMOUNT</dt>
          <dd class="booking-summary__total">₹${totalPrice}</dd>
        </div>
      </dl>

      <div class="booking-summary__barcode" aria-hidden="true">
        <span class="booking-summary__barcode-lines"></span>
        <span class="booking-summary__barcode-code">SPOTSHOW-2030-LOCK-TX</span>
      </div>

      <button
        class="booking-summary__button"
        type="button"
        data-action="proceed-booking"
        ${selectedSeats.length === 0 ? "disabled" : ""}
      >
        CONFIRM SEAT SELECTION →
      </button>
      <p class="booking-summary__hint">Row-locked concurrency reservation backed by PostgreSQL.</p>
    </aside>
  `;
}
