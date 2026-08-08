import type { Seat } from "../../types/seat";
import { getSelectedSeatIds } from "../../store/booking.store";
import { getSeatLabel } from "../../utils/seat.utils";
import { calculateTotalPrice } from "../../utils/booking.utils";

export function BookingSummary(seats: Seat[]) {
  const selectedSeatIds = getSelectedSeatIds();

  const selectedSeats = seats.filter((seat) => selectedSeatIds.has(seat.id));
  const totalPrice = calculateTotalPrice(selectedSeats.length);

  return `
    <aside class="booking-summary">

      <h2 class="booking-summary__title">
        Booking Summary
      </h2>

      <div class="booking-summary__seats">
        ${
          selectedSeats.length === 0
            ? `
              <p class="booking-summary__empty">
                No seats selected
              </p>
            `
            : selectedSeats
                .map((seat) => {
                  const index = seats.indexOf(seat);

                  return `
                    <span class="booking-summary__seat">
                      ${getSeatLabel(index)}
                    </span>
                  `;
                })
                .join("")
        }
      </div>

      <p class="booking-summary__count">
        ${selectedSeats.length}
        seat${selectedSeats.length === 1 ? "" : "s"} selected
      </p>

      <p class="booking-summary__price">
        Total: ₹${totalPrice}
      </p>

      <button
        class="booking-summary__button"
        type="button"
        data-action="proceed-booking"
        ${selectedSeats.length === 0 ? "disabled" : ""}
        >
           Proceed to Booking
      </button>
    </aside>
  `;
}
