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

const FORMATS_MAP: Record<string, string> = {
  "Spider-Man: Brand New Day": "70MM PANAVISION · ATMOS",
  "Avengers: Doomsday": "IMAX DUAL LASER · 12-CH",
  "Mahavatar Narasimha": "35MM CELLULOID · OPTICAL",
  "Mahavatar Parshuram": "70MM ULTRA KODAK · ATMOS",
};

export async function Show() {
  const showId = window.location.pathname.split("/")[2];

  if (!showId) {
    return `
      <main class="container narrow">
        <div class="empty-state" role="alert">
          Invalid feature reference. <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Back to programme</a>
        </div>
      </main>
    `;
  }

  // Clear selections across different shows
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
          Unable to retrieve screening details. Please try again.
          <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Return to programme</a>
        </div>
      </main>
    `;
  }

  if (!show) {
    return `
      <main class="container narrow">
        <div class="empty-state" role="alert">
          Feature film not found in archive.
          <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Return to programme</a>
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

  const formatText = FORMATS_MAP[show.movieName] ?? "70MM THEATRICAL · ATMOS";

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
      <div class="show-breadcrumb">
        <a class="back-link" href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">
          ← RETURN TO ARCHIVAL PROGRAMME
        </a>
      </div>

      <header class="show-header">
        <div class="show-header__poster-box">
          <img
            class="show-header__poster"
            src="${poster}"
            alt="${show.movieName} Poster"
          />
        </div>
        <div class="show-header__info">
          <div class="show-header__badge-row">
            <span class="show-header__status-badge">SPOTSHOW THEATRICAL ENGAGEMENT</span>
            <span class="show-header__format-badge">${formatText}</span>
          </div>
          <h1 class="show-header__title">${show.movieName}</h1>
          <p class="show-header__time">${dateLabel}</p>
          <div class="show-header__meta-row">
            <span>AUDITORIUM 01</span>
            <span>·</span>
            <span>${seats.length} TOTAL SEATS</span>
            <span>·</span>
            <span>₹200 ADMIT TARIFF</span>
            <span>·</span>
            <span>ROW-LEVEL ACID LOCKING</span>
          </div>
        </div>
      </header>

      <div class="show-booking-layout">
        <section class="show-auditorium" aria-labelledby="show-seat-title">
          <div class="show-auditorium__head">
            <div>
              <h2 id="show-seat-title" class="show-auditorium__title">AUDITORIUM SEAT SELECTION</h2>
              <p class="show-auditorium__subtitle">Click seats to add to your reservation pass. Seating state is synchronized in real-time.</p>
            </div>
            <div class="seat-legend" aria-label="Seat availability legend">
              <span class="seat-legend__item">
                <span class="seat-legend__swatch seat-legend__swatch--available" aria-hidden="true"></span>
                AVAILABLE
              </span>
              <span class="seat-legend__item">
                <span class="seat-legend__swatch seat-legend__swatch--selected" aria-hidden="true"></span>
                SELECTED
              </span>
              <span class="seat-legend__item">
                <span class="seat-legend__swatch seat-legend__swatch--booked" aria-hidden="true"></span>
                OCCUPIED
              </span>
            </div>
          </div>

          ${SeatGrid(seats)}
        </section>

        <div class="booking-summary-container">
          ${BookingSummary(seats)}
        </div>
      </div>

      <!-- A24 Membership Sign-In Gate Modal -->
      <div class="login-modal" data-login-modal role="dialog" aria-modal="true" aria-labelledby="login-required-title">
        <div class="login-modal__content card">
          <div class="login-modal__tag">MEMBER ACCESS REQUIRED</div>
          <h2 id="login-required-title" class="login-modal__heading">AUTHENTICATE RESERVATION</h2>
          <p class="login-modal__desc">
            SpotShow locks seats to authenticated member accounts to guarantee transactional integrity and prevent duplicate reservations.
          </p>
          <div class="login-modal__actions">
            <button type="button" class="btn-ghost" data-action="close-login-modal">DISMISS</button>
            <button type="button" class="btn-primary" data-action="login-from-modal">SIGN IN TO CONFIRM</button>
          </div>
        </div>
      </div>
    </main>
  `;
}
