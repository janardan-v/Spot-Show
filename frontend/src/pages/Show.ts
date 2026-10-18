import { fetchSeats } from "../services/seat.service";
import { SeatGrid } from "../components/booking/SeatGrid";
import {
  toggleSeat,
  subscribe,
  clearSelectedSeats,
} from "../store/booking.store";
import { BookingSummary } from "../components/booking/BookingSummary";
import { registerCleanup } from "../utils/lifecycle";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";
import { moviePosters } from "../utils/moviePosters";
import { getShows } from "../api/movie.api";
import { isAuthenticated } from "../store/auth.store";

let lastShowId: string | null = null;

export async function Show() {
  const showId = window.location.pathname.split("/")[2];

  if (!showId) {
    return `
      <main class="container narrow">
        <div class="empty-state" role="alert">
          Invalid show. <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Back to shows</a>
        </div>
      </main>
    `;
  }

  // Avoid leaking selection across different shows (same in-memory Set).
  if (lastShowId !== null && lastShowId !== showId) {
    clearSelectedSeats();
  }
  lastShowId = showId;

  let show;
  let seats;

  try {
    const [{ showResult }, fetchedSeats] = await Promise.all([
      getShows(),
      fetchSeats(showId),
    ]);
    show = showResult.find((s) => s.id === showId);
    seats = fetchedSeats;
  } catch {
    return `
      <main class="container narrow">
        <div class="empty-state" role="alert">
          Could not load this show. Please try again.
          <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Back to shows</a>
        </div>
      </main>
    `;
  }

  if (!show) {
    return `
      <main class="container narrow">
        <div class="empty-state" role="alert">
          Show not found.
          <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Back to shows</a>
        </div>
      </main>
    `;
  }

  const poster = moviePosters[show.movieName] ?? moviePosters.default;
  const showDate = new Date(show.showDate);
  const dateLabel = isNaN(showDate.getTime())
    ? String(show.showDate)
    : showDate.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

  setTimeout(() => {
    const seatGrid = document.querySelector<HTMLDivElement>(".seat-grid");

    if (seatGrid) {
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
        // Store is source of truth; class synced from subscribe re-render
        // plus immediate toggle for responsiveness.
        seatButton.classList.toggle("seat--selected");
        seatButton.classList.toggle("seat--available");
        seatButton.setAttribute(
          "aria-pressed",
          seatButton.classList.contains("seat--selected") ? "true" : "false",
        );
      });
    }

    const unsubscribe = subscribe(() => {
      const summaryContainer = document.querySelector<HTMLDivElement>(
        ".booking-summary-container",
      );
      if (!summaryContainer || !seats) {
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
          modal
            .querySelector<HTMLButtonElement>('[data-action="close-login-modal"]')
            ?.focus();
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
      loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) {
          loginModal.classList.remove("login-modal--visible");
        }
      });
      document.addEventListener(
        "keydown",
        function esc(e) {
          if (e.key === "Escape") {
            loginModal.classList.remove("login-modal--visible");
            document.removeEventListener("keydown", esc);
          }
        },
      );
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
    <main class="container show-page">
      <a class="back-link" href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">← All shows</a>

      <section class="show-header card">
        <img
          class="show-header__poster"
          src="${poster}"
          alt="${show.movieName}"
        />
        <div class="show-header__info">
          <p class="eyebrow">Now screening</p>
          <h1 class="show-header__title">${show.movieName}</h1>
          <p class="show-header__time">${dateLabel}</p>
          <p class="show-header__meta">${seats.length} seats · ₹200 each</p>
        </div>
      </section>

      <div class="show-booking-layout">
        <section class="show-auditorium card" aria-labelledby="show-seat-title">
          <div class="section-head section-head--tight">
            <div>
              <h2 id="show-seat-title">Select your seats</h2>
              <p class="section-sub">Tap to select. Selected seats are held for this session.</p>
            </div>
          </div>

          <div class="seat-legend" aria-label="Seat availability">
            <span class="seat-legend__item">
              <span class="seat-legend__swatch seat-legend__swatch--available" aria-hidden="true"></span>
              Available
            </span>
            <span class="seat-legend__item">
              <span class="seat-legend__swatch seat-legend__swatch--selected" aria-hidden="true"></span>
              Selected
            </span>
            <span class="seat-legend__item">
              <span class="seat-legend__swatch seat-legend__swatch--booked" aria-hidden="true"></span>
              Occupied
            </span>
          </div>

          ${SeatGrid(seats)}
        </section>

        <div class="booking-summary-container">
          ${BookingSummary(seats)}
        </div>
      </div>

      <div class="login-modal" data-login-modal role="dialog" aria-modal="true" aria-labelledby="login-required-title">
        <div class="login-modal__content card">
          <h2 id="login-required-title">Log in to continue</h2>
          <p>You need an account to hold these seats.</p>
          <div class="login-modal__actions">
            <button type="button" class="btn-ghost" data-action="close-login-modal">Cancel</button>
            <button type="button" class="btn-primary" data-action="login-from-modal">Log in</button>
          </div>
        </div>
      </div>
    </main>
  `;
}
