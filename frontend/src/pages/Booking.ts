import { removeSelectedSeat, getSelectedSeatIds } from "../store/booking.store";
import { fetchSeats } from "../services/seat.service";
import { getSeatLabel } from "../utils/seat.utils";
import { calculateTotalPrice } from "../utils/booking.utils";
import { bookSeat } from "../api/booking.api";
import { getShows } from "../api/movie.api";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";

export async function Booking() {
  const params = new URLSearchParams(window.location.search);
  const showId = params.get("showId");

  if (!showId) {
    return `
      <main class="container narrow">
        <div class="empty-state" role="alert">
          Invalid booking — show is missing.
          <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Back to shows</a>
        </div>
      </main>
    `;
  }

  let seats;
  let show;

  try {
    const [fetchedSeats, { showResult }] = await Promise.all([
      fetchSeats(showId),
      getShows(),
    ]);
    seats = fetchedSeats;
    show = showResult.find((s) => s.id === showId);
  } catch {
    return `
      <main class="container narrow">
        <div class="empty-state" role="alert">
          Could not load booking. Please try again.
          <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Back to shows</a>
        </div>
      </main>
    `;
  }

  if (!show || !seats) {
    return `
    <main class="container narrow">
      <div class="empty-state" role="alert">
        Show not found.
        <a href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">Back to shows</a>
      </div>
    </main>
  `;
  }

  const selectedSeatIds = getSelectedSeatIds();
  const selectedSeats = seats.filter((seat) => selectedSeatIds.has(seat.id));
  const totalPrice = calculateTotalPrice(selectedSeats.length);

  const updateSelectionUI = () => {
    const currentSelectedSeatIds = getSelectedSeatIds();
    const currentSelectedSeats = seats.filter((seat) =>
      currentSelectedSeatIds.has(seat.id),
    );

    const selectedSeatsContainer = document.querySelector<HTMLDivElement>(
      "[data-selected-seats]",
    );
    const selectedCount = document.querySelector<HTMLParagraphElement>(
      "[data-selected-count]",
    );
    const totalEl = document.querySelector<HTMLElement>("[data-booking-total]");
    const button = document.querySelector<HTMLButtonElement>(
      '[data-action="confirm-booking"]',
    );

    if (selectedSeatsContainer) {
      selectedSeatsContainer.innerHTML =
        currentSelectedSeats.length === 0
          ? `<p class="booking-summary__empty">No seats selected</p>`
          : currentSelectedSeats
              .map((seat) => {
                const index = seats.indexOf(seat);
                return `<span class="selected-seat">${getSeatLabel(index)}</span>`;
              })
              .join("");
    }

    if (selectedCount) {
      selectedCount.textContent = `${currentSelectedSeats.length} seat${
        currentSelectedSeats.length === 1 ? "" : "s"
      } selected`;
    }

    if (totalEl) {
      totalEl.textContent = `₹${calculateTotalPrice(currentSelectedSeats.length)}`;
    }

    if (button) {
      button.disabled = currentSelectedSeats.length === 0;
    }
  };

  setTimeout(() => {
    const button = document.querySelector<HTMLButtonElement>(
      '[data-action="confirm-booking"]',
    );
    if (!button) {
      return;
    }

    const message = document.querySelector<HTMLDivElement>(
      "[data-booking-message]",
    );

    button.addEventListener("click", async () => {
      if (selectedSeats.length === 0) {
        return;
      }

      button.disabled = true;
      button.textContent = "Booking...";

      const bookedSeats = [];
      const failedSeats = [];

      for (const seat of selectedSeats) {
        const label = getSeatLabel(seats.indexOf(seat));

        try {
          await bookSeat(seat.id);
          bookedSeats.push({ seat, label });
          removeSelectedSeat(seat.id);
          updateSelectionUI();
        } catch (error) {
          console.error(`Failed to book seat: ${label}`, error);
          failedSeats.push({ seat, label });
          removeSelectedSeat(seat.id);
          updateSelectionUI();
        }
      }

      if (message) {
        if (failedSeats.length === 0) {
          message.className = "booking-message booking-message--success";
          message.innerHTML = `
      <strong>Booking confirmed</strong>
      <p>All selected seats were booked successfully.</p>
      <ul>
        ${bookedSeats.map(({ label }) => `<li>${label} — booked</li>`).join("")}
      </ul>
    `;
        } else {
          message.className = "booking-message booking-message--warning";
          message.innerHTML = `
      <strong>Partial booking</strong>
      ${
        bookedSeats.length > 0
          ? `<p><strong>Booked:</strong></p>
            <ul>${bookedSeats.map(({ label }) => `<li>${label} — booked</li>`).join("")}</ul>`
          : ""
      }
      <p><strong>Not booked:</strong></p>
      <ul>${failedSeats.map(({ label }) => `<li>${label} — already booked</li>`).join("")}</ul>
    `;
        }
      }

      if (failedSeats.length === 0) {
        setTimeout(() => {
          navigate(`${ROUTES.SHOW}/${showId}`);
        }, 2000);
      }

      button.textContent =
        bookedSeats.length === selectedSeats.length
          ? "Booking complete"
          : "Booking attempted";
    });
  });

  const showDate = new Date(show.showDate);
  const dateLabel = isNaN(showDate.getTime())
    ? String(show.showDate)
    : showDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  const timeLabel = isNaN(showDate.getTime())
    ? ""
    : showDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return `
  <main class="container narrow booking-page">
    <a class="back-link" href="${ROUTES.SHOW}/${showId}" data-route="${ROUTES.SHOW}/${showId}">← Back to seats</a>

    <section class="booking-card card" aria-labelledby="booking-title">
      <p class="eyebrow">Review & confirm</p>
      <h1 id="booking-title">Booking summary</h1>
      <p class="section-sub">${show.movieName} · ${dateLabel}${timeLabel ? ` · ${timeLabel}` : ""}</p>

      <h2 class="booking-card__label">Selected seats</h2>
      <div class="selected-seats" data-selected-seats>
        ${
          selectedSeats.length === 0
            ? `<p class="booking-summary__empty">No seats selected</p>`
            : selectedSeats
                .map((seat) => {
                  const index = seats.indexOf(seat);
                  return `<span class="selected-seat">${getSeatLabel(index)}</span>`;
                })
                .join("")
        }
      </div>

      <dl class="booking-summary__rows">
        <div><dt>Seats</dt><dd data-selected-count>${selectedSeats.length} seat${selectedSeats.length === 1 ? "" : "s"} selected</dd></div>
        <div><dt>Total</dt><dd class="booking-summary__total" data-booking-total>₹${totalPrice}</dd></div>
      </dl>

      <div class="booking-message" data-booking-message aria-live="polite"></div>

      <button
        type="button"
        class="booking-confirm"
        data-action="confirm-booking"
        ${selectedSeats.length === 0 ? "disabled" : ""}
      >
        Confirm booking
      </button>
    </section>
  </main>
`;
}
