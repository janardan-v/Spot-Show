import { fetchSeats } from "../services/seat.service";
import { SeatGrid } from "../components/booking/SeatGrid";
import { toggleSeat, subscribe } from "../store/booking.store";
import { BookingSummary } from "../components/booking/BookingSummary";
import { registerCleanup } from "../utils/lifecycle";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";

export async function Show() {
  const showId = window.location.pathname.split("/")[2];

  const seats = await fetchSeats(showId);

  setTimeout(() => {
    const seatGrid = document.querySelector<HTMLDivElement>(".seat-grid");

    if (!seatGrid) {
      return;
    }

    seatGrid.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      const seatButton = target.closest<HTMLButtonElement>(".seat");

      if (!seatButton || seatButton.disabled) {
        return;
      }

      const seatId = seatButton.dataset.seatId;

      if (!seatId) {
        return;
      }

      toggleSeat(seatId);

      seatButton.classList.toggle("seat--selected");
    });

    const unsubscribe = subscribe(() => {
      const summaryContainer = document.querySelector<HTMLDivElement>(
        ".booking-summary-container",
      );

      if (!summaryContainer) {
        return;
      }

      summaryContainer.innerHTML = BookingSummary(seats);
    });

    registerCleanup(unsubscribe);

    const summaryContainer = document.querySelector<HTMLDivElement>(
      ".booking-summary-container",
    );

    if (summaryContainer) {
      summaryContainer.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;

        const button = target.closest<HTMLButtonElement>(
          '[data-action="proceed-booking"]',
        );

        if (!button || button.disabled) {
          return;
        }

        console.log("Proceed to booking");
      });
    }
  });

  return `
    <main class="container">

      <h1>Show Details</h1>

      <p>Show ID: ${showId}</p>

      <p>Total Seats: ${seats.length}</p>

      ${SeatGrid(seats)}

      <div class="booking-summary-container">
        ${BookingSummary(seats)}
      </div>

    </main>
  `;
}
