import { fetchSeats } from "../services/seat.service";
import { SeatGrid } from "../components/booking/SeatGrid";
import { toggleSeat, subscribe } from "../store/booking.store";
import { BookingSummary } from "../components/booking/BookingSummary";
import { registerCleanup } from "../utils/lifecycle";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";
import { moviePosters } from "../utils/moviePosters";
import { getShows } from "../api/movie.api";
import { isAuthenticated } from "../store/auth.store";

export async function Show() {
  const showId = window.location.pathname.split("/")[2];

  const [{ showResult }, seats] = await Promise.all([
    getShows(),
    fetchSeats(showId),
  ]);

  const show = showResult.find((show) => show.id === showId);

  if (!show) {
    throw new Error("Show not found");
  }
  const poster = moviePosters[show.movieName] ?? moviePosters.default;

  setTimeout(() => {
    const seatGrid = document.querySelector<HTMLDivElement>(".seat-grid");

    if (!seatGrid) {
      return;
    }

    seatGrid.addEventListener("click", (event) => {
      console.log("SEAT GRID CLICK");
      const target = event.target as HTMLElement;

      const seatButton = target.closest<HTMLButtonElement>(".seat");

      if (!seatButton || seatButton.disabled) {
        return;
      }

      console.log("SEAT BUTTON:", seatButton);
      const seatId = seatButton.dataset.seatId;

      if (!seatId) {
        return;
      }

      console.log("SELECTED SEAT:", {
        seatId,
        label: seatButton.textContent,
      });

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

        if (!isAuthenticated()) {
          const modal =
            document.querySelector<HTMLDivElement>("[data-login-modal]");

          if (!modal) {
            return;
          }

          modal.classList.add("login-modal--visible");
          return;
        }

        navigate(`${ROUTES.BOOKING}?showId=${showId}`);
      });
    }

    const loginModal =
      document.querySelector<HTMLDivElement>("[data-login-modal]");

    const closeLoginModal = document.querySelector<HTMLButtonElement>(
      '[data-action="close-login-modal"]',
    );

    const loginFromModal = document.querySelector<HTMLButtonElement>(
      '[data-action="login-from-modal"]',
    );

    if (loginModal && closeLoginModal && loginFromModal) {
      closeLoginModal.addEventListener("click", () => {
        loginModal.classList.remove("login-modal--visible");
      });

      loginFromModal.addEventListener("click", () => {
        navigate(
          `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(
            `${ROUTES.BOOKING}?showId=${showId}`,
          )}`,
        );
      });
    }
  });

  return `
    <main class="container">

      <section class="show-header">

      <img
        class="show-header__poster"
        src="${poster}"
        alt="${show.movieName}"
      />

      <div class="show-header__info">

      <h1 class="show-header__title">
      ${show.movieName}
      </h1>

      <p class="show-header__time">
      ${new Date(show.showDate).toLocaleString()}
      </p>

      <p class="show-header__meta">
        Total Seats: ${seats.length}
      </p>

      </div>
    </section>

    <div class="show-booking-layout">
      <div class="show-booking-sticky">
        <section
          class="show-auditorium"
          aria-labelledby="show-seat-title"
        >
          <h2 id="show-seat-title" class="show-seats__title">
            Select Your Seats
          </h2>

          <div class="seat-legend" aria-label="Seat availability">
            <span class="seat-legend__item">
              <span
                class="seat-legend__swatch seat-legend__swatch--available"
                aria-hidden="true"
              ></span>
              Available
            </span>
            <span class="seat-legend__item">
              <span
                class="seat-legend__swatch seat-legend__swatch--selected"
                aria-hidden="true"
              ></span>
              Selected
            </span>
            <span class="seat-legend__item">
              <span
                class="seat-legend__swatch seat-legend__swatch--booked"
                aria-hidden="true"
              ></span>
              Occupied
            </span>
          </div>

          ${SeatGrid(seats)}
        </section>

        <div class="booking-summary-container">
          ${BookingSummary(seats)}
        </div>
      </div>
    </div>
<div
    class="login-modal"
    data-login-modal
  >
    <div class="login-modal__content">

      <h2>Login Required</h2>

      <p>
        You are not logged in. Please login to continue with your booking.
      </p>

      <div class="login-modal__actions">

        <button
          type="button"
          data-action="close-login-modal"
        >
          Cancel
        </button>

        <button
          type="button"
          data-action="login-from-modal"
        >
          Login
        </button>

        </div>

        </div>
      </div>


    </main>
  `;
}