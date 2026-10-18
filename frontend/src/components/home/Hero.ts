import { fetchShows } from "../../services/movie.service";
import { SEAT_PRICE } from "../../utils/booking.utils";
import type { Movie } from "../../types/movie";

/*
 * Hero — Concise "The Programme" front-of-house introduction.
 *
 * Designed as a streamlined introduction that presents essential screening
 * facts (titles, dates, showtimes, booking links) without an oversized
 * board that competes with the infinite gallery reel below.
 */

const parseShowDate = (raw: string) => {
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const timeLabel = (date: Date | null, fallback: string) =>
  date
    ? date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : fallback;

const dateLabel = (date: Date | null, fallback: string) =>
  date
    ? date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : fallback;

const bySchedule = (a: Movie, b: Movie) => {
  const first = parseShowDate(a.showDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const second = parseShowDate(b.showDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return first - second;
};

export async function Hero() {
  let shows: Movie[] = [];
  let failed = false;

  try {
    shows = await fetchShows();
  } catch {
    failed = true;
  }

  if (failed || !shows.length) {
    return `
      <section class="hero hero--quiet">
        <div class="hero__inner">
          <p class="hero__eyebrow">The Programme</p>
          <h1 class="hero__title">
            ${failed ? "The programme is unavailable right now." : "No screenings scheduled yet."}
          </h1>
          <p class="hero__note">
            ${failed ? "Live showtimes could not be loaded." : "New screenings will be announced shortly."}
          </p>
        </div>
      </section>
    `;
  }

  const programme = [...shows].sort(bySchedule);
  const firstDate = parseShowDate(programme[0]?.showDate);
  const lastDate = parseShowDate(programme[programme.length - 1]?.showDate);

  const dateSpan =
    firstDate && lastDate
      ? `${firstDate.getDate()}–${lastDate.getDate()} ${lastDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`
      : "August 2030";

  return `
    <section class="hero" aria-label="The Programme Introduction">
      <div class="hero__inner">
        <div class="hero__header">
          <div class="hero__headline-group">
            <p class="hero__eyebrow">The Programme</p>
            <h1 class="hero__title" id="hero-title">Now screening</h1>
          </div>
          <div class="hero__summary">
            <span class="hero__summary-span">${dateSpan}</span>
            <span class="hero__summary-dot" aria-hidden="true">·</span>
            <span>${programme.length} feature films</span>
            <span class="hero__summary-dot" aria-hidden="true">·</span>
            <span>₹${SEAT_PRICE} a seat</span>
          </div>
        </div>

        <ul class="hero__schedule" role="list">
          ${programme
            .map((movie) => {
              const date = parseShowDate(movie.showDate);
              const href = `/shows/${movie.id}`;
              const time = timeLabel(date, "18:00");
              const fullDate = dateLabel(date, "");

              return `
                <li class="hero__item">
                  <a class="hero__link" href="${href}" data-route="${href}" aria-label="Screening details for ${movie.movieName}">
                    <span class="hero__item-time">${time}</span>
                    <span class="hero__item-title">${movie.movieName}</span>
                    <span class="hero__item-date">${fullDate}</span>
                    <span class="hero__item-seats">${movie.totalSeats} seats</span>
                    <span class="hero__item-action" aria-hidden="true">Book seats →</span>
                  </a>
                </li>
              `;
            })
            .join("")}
        </ul>

        <div class="hero__transition" aria-hidden="true">
          <span class="hero__transition-rule"></span>
          <span class="hero__transition-text">The continuous reel ↓</span>
          <span class="hero__transition-rule"></span>
        </div>
      </div>
    </section>
  `;
}
