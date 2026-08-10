import { removeSelectedSeat, getSelectedSeatIds } from "../store/booking.store";
import { fetchSeats } from "../services/seat.service";
import { getSeatLabel } from "../utils/seat.utils";
import { bookSeat } from "../api/booking.api";
import { getShows } from "../api/movie.api";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";

export async function Booking() {
  const params = new URLSearchParams(window.location.search);

  const showId = params.get("showId");

  if (!showId) {
    return `
      <main class="container">
        <h1>Invalid booking</h1>
        <p>Show ID is missing.</p>
      </main>
    `;
  }

  const [seats, { showResult }] = await Promise.all([
    fetchSeats(showId),
    getShows(),
  ]);

  const show = showResult.find((show) => show.id === showId);

  if (!show) {
    return `
    <main class="container">
      <h1>Show not found</h1>
      <p>The selected show could not be found.</p>
    </main>
  `;
  }
  const selectedSeatIds = getSelectedSeatIds();

  const selectedSeats = seats.filter((seat) => selectedSeatIds.has(seat.id));

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

    const button = document.querySelector<HTMLButtonElement>(
      '[data-action="confirm-booking"]',
    );

    if (selectedSeatsContainer) {
      selectedSeatsContainer.innerHTML =
        currentSelectedSeats.length === 0
          ? "No seats selected"
          : currentSelectedSeats
              .map((seat) => {
                const index = seats.indexOf(seat);

                return `
                <span class="selected-seat">
                  ${getSeatLabel(index)}
                </span>
              `;
              })
              .join(" ");
    }

    if (selectedCount) {
      selectedCount.textContent = `${currentSelectedSeats.length} seat${
        currentSelectedSeats.length === 1 ? "" : "s"
      } selected`;
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

          bookedSeats.push({
            seat,
            label,
          });

          removeSelectedSeat(seat.id);
          updateSelectionUI();
        } catch (error) {
          console.error(
            `Failed to book seat: ${getSeatLabel(seats.indexOf(seat))}`,
            error,
          );
          failedSeats.push({
            seat,
            label,
          });
          removeSelectedSeat(seat.id);
          updateSelectionUI();
        }
      }

      if (message) {
        if (failedSeats.length === 0) {
          message.className = "booking-message booking-message--success";

          message.innerHTML = `
      <strong>✓ Booking confirmed</strong>

      <p>All selected seats were booked successfully.</p>

      <ul>
        ${bookedSeats
          .map(({ label }) => `<li>✓ ${label} — Booked successfully</li>`)
          .join("")}
      </ul>
    `;
        } else {
          message.className = "booking-message booking-message--warning";

          message.innerHTML = `
      <strong>⚠ Partial booking</strong>

      ${
        bookedSeats.length > 0
          ? `
            <p><strong>Booked:</strong></p>
            <ul>
              ${bookedSeats
                .map(({ label }) => `<li>✓ ${label} — Booked successfully</li>`)
                .join("")}
            </ul>
          `
          : ""
      }

      <p><strong>Not booked:</strong></p>

      <ul>
        ${failedSeats
          .map(({ label }) => `<li>✕ ${label} — Already booked</li>`)
          .join("")}
      </ul>
    `;
        }
      }
      if (failedSeats.length === 0) {
        setTimeout(() => {
          navigate(`${ROUTES.SHOW}/${showId}`);
      }, 2000);
      }

      if (bookedSeats.length === selectedSeats.length) {
        button.textContent = "Booking Complete";
      } else {
        button.textContent = "Booking Attempted";
      }
    });
  });

  return `
  <main class="booking-page">
  <section class="booking-summary">

    <h1>Booking Summary</h1>

    <div class="booking-show-info">

      <h2>${show.movieName}</h2>

      <p>
        ${new Date(show.showDate).toLocaleDateString()}
      </p>

      <p>
        ${new Date(show.showDate).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

    </div>

    <h2>Selected Seats</h2>

    <div class="selected-seats" data-selected-seats>
      ${
        selectedSeats.length === 0
          ? "No seats selected"
          : selectedSeats
              .map((seat) => {
                const index = seats.indexOf(seat);

                return `
                  <span class="selected-seat">
                    ${getSeatLabel(index)}
                  </span>
                `;
              })
              .join(" ")
      }
    </div>

    <p data-selected-count>
      ${selectedSeats.length} seat${
        selectedSeats.length === 1 ? "" : "s"
      } selected
    </p>

    <div
      class="booking-message"
      data-booking-message
      aria-live="polite"
    ></div>

    <button
      type="button"
      data-action="confirm-booking"
      ${selectedSeats.length === 0 ? "disabled" : ""}
    >
      Confirm Booking
    </button>

  </section>
  </main>
`;
}
