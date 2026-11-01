import { fetchShows } from "../../services/movie.service";
import { moviePosters } from "../../utils/moviePosters";
import { registerCleanup } from "../../utils/lifecycle";
import { SEAT_PRICE } from "../../utils/booking.utils";
import type { Movie } from "../../types/movie";

interface FilmCuratorialData {
  quote: string;
  critic: string;
  format: string;
  aspect: string;
  audio: string;
  runtime: string;
  director: string;
}

const FILM_METADATA: Record<string, FilmCuratorialData> = {
  "Spider-Man: Brand New Day": {
    quote: "A grounded, rain-drenched return to classic street-level heroics. Pure textural grit and cinematic momentum.",
    critic: "Sight & Sound",
    format: "70MM PANAVISION",
    aspect: "2.39:1 ANAMORPHIC",
    audio: "DOLBY ATMOS 12-CH",
    runtime: "148 MIN",
    director: "Destin Daniel Cretton",
  },
  "Avengers: Doomsday": {
    quote: "An ominous, monumental descent into multiversal collapse. Towering visual ambition and tragic grandeur.",
    critic: "Cahiers du Cinéma",
    format: "IMAX DUAL LASER",
    aspect: "1.90:1 EXPANDED",
    audio: "12-CHANNEL SOUND",
    runtime: "165 MIN",
    director: "Anthony & Joe Russo",
  },
  "Mahavatar Narasimha": {
    quote: "Mythic Indian epic cinema elevated to ferocious, godlike fury and breathtaking visual spectacle.",
    critic: "Film Comment",
    format: "35MM CELLULOID",
    aspect: "2.35:1 WIDESCREEN",
    audio: "DOLBY ATMOS SURROUND",
    runtime: "155 MIN",
    director: "Ashwin Kumar",
  },
  "Mahavatar Parshuram": {
    quote: "An indomitable warrior-sage chronicle of Himalayan proportions. Epic myth meets relentless analog kinetic force.",
    critic: "Little White Lies",
    format: "70MM ULTRA KODAK",
    aspect: "2.76:1 ULTRA-PANAVISION",
    audio: "DOLBY ATMOS 12-CH",
    runtime: "160 MIN",
    director: "Ashwin Kumar",
  },
};

const DEFAULT_METADATA: FilmCuratorialData = {
  quote: "An exceptional theatrical presentation curated exclusively for the SpotShow 2030 archive.",
  critic: "The Film Journal",
  format: "70MM THEATRICAL",
  aspect: "2.39:1 ANAMORPHIC",
  audio: "DOLBY ATMOS",
  runtime: "145 MIN",
  director: "Curated Theatrical Selection",
};

export async function NowShowing() {
  let shows: Movie[] = [];

  try {
    shows = await fetchShows();
  } catch {
    return `
      <section id="now-showing" class="now-showing container">
        <div class="empty-state" role="alert">
          Unable to retrieve archival screenings. Please refresh.
        </div>
      </section>
    `;
  }

  if (!shows.length) {
    return `
      <section id="now-showing" class="now-showing container">
        <div class="empty-state">No archival feature films scheduled currently.</div>
      </section>
    `;
  }

  /*
   * A24 Physical Vinyl Crate & Continuous Archival Reel ("SpotShow")
   *
   * Inspired by the award-winning A24 SOTD digital experience:
   * Features tactile film sleeves, sliding vinyl record discs,
   * high-fashion editorial typography, and seamless bidirectional infinite loop.
   */
  setTimeout(() => {
    const section = document.querySelector<HTMLElement>("#now-showing");
    const sequence = section?.querySelector<HTMLElement>(".crate__sequence");
    const sticky = section?.querySelector<HTMLElement>(".crate__sticky");
    const viewport = section?.querySelector<HTMLElement>(".crate__viewport");
    const track = section?.querySelector<HTMLElement>(".crate__track");
    const panels = Array.from(
      section?.querySelectorAll<HTMLElement>(".crate__panel") ?? [],
    );
    const discs = Array.from(
      section?.querySelectorAll<HTMLElement>(".crate__disc") ?? [],
    );
    const counter = section?.querySelector<HTMLElement>(".crate__counter");
    const chromeNo = section?.querySelector<HTMLElement>(".crate__chrome-no");

    if (!section || !sequence || !sticky || !viewport || !track || !panels.length) {
      return;
    }

    const numShows = shows.length;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = 0;
    let lastIndex = -1;
    let pinnedTop = 0;
    let isWrapping = false;
    let hasEnteredLoop = false;

    let cycleWidth = 0;
    let cycleScroll = 0;
    let centerShift = 0;
    let pinStart = 0;

    const syncReduced = () => {
      sequence.classList.toggle("is-reduced", reducedMotion.matches);
    };

    const measure = () => {
      const topVal = parseFloat(window.getComputedStyle(sticky).top);
      pinnedTop = Number.isFinite(topVal) ? topVal : 0;

      const viewportWidth = sticky.clientWidth;

      cycleWidth = 0;
      for (let i = 0; i < numShows; i++) {
        cycleWidth += panels[i]?.offsetWidth ?? 0;
      }

      if (cycleWidth <= 0) {
        cycleWidth = viewportWidth * 2.8;
      }

      cycleScroll = Math.max(window.innerHeight * 1.5, 1300);
      sequence.style.height = `${cycleScroll * 6}px`;

      const seqRect = sequence.getBoundingClientRect();
      pinStart = seqRect.top + window.scrollY - pinnedTop;

      const centerPanel = panels[2 * numShows] ?? panels[0];
      centerShift =
        centerPanel.offsetLeft + centerPanel.offsetWidth / 2 - viewportWidth / 2;
    };

    syncReduced();
    measure();

    const render = () => {
      rafId = 0;

      if (reducedMotion.matches) {
        track.style.transform = "";
        panels.forEach((panel) => {
          panel.classList.remove("is-active");
        });
        return;
      }

      const currentY = window.scrollY;
      const dY = hasEnteredLoop ? currentY - pinStart : Math.max(0, currentY - pinStart);

      if (!isWrapping) {
        if (dY >= 2 * cycleScroll) {
          isWrapping = true;
          window.scrollTo({ top: currentY - cycleScroll, behavior: "instant" });
          window.requestAnimationFrame(() => {
            isWrapping = false;
          });
          return;
        } else if (hasEnteredLoop && dY < 0 && currentY > 50) {
          isWrapping = true;
          window.scrollTo({ top: currentY + cycleScroll, behavior: "instant" });
          window.requestAnimationFrame(() => {
            isWrapping = false;
          });
          return;
        }
      }

      if (dY >= 0) {
        hasEnteredLoop = true;
      }

      const viewportWidth = sticky.clientWidth;
      const stickyRect = sticky.getBoundingClientRect();
      const vpCenter = stickyRect.left + viewportWidth / 2;

      // Continuous horizontal travel
      const shift = centerShift + (dY / cycleScroll) * cycleWidth;
      track.style.transform = `translate3d(${-shift.toFixed(2)}px, 0, 0)`;

      // Proximity detection for active A24 vinyl jacket focus
      let closestDist = Infinity;
      let activePanelIdx = -1;
      let activeFilmIndex = 0;

      panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        const panelCenter = rect.left + rect.width / 2;
        const dist = Math.abs(panelCenter - vpCenter);

        if (dist < closestDist) {
          closestDist = dist;
          activePanelIdx = index;
          activeFilmIndex = index % numShows;
        }

        // Tactile depth perspective
        const distanceNorm = (panelCenter - vpCenter) / (viewportWidth * 0.5);
        const absDist = Math.abs(distanceNorm);
        const rotateY = Math.max(-12, Math.min(12, distanceNorm * -8));
        const scale = 1 - Math.min(absDist * 0.04, 0.08);

        panel.style.transform = `perspective(1200px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      });

      // Update active state and drive physical vinyl disc slide & rotation
      panels.forEach((panel, idx) => {
        const isActive = idx === activePanelIdx;
        panel.classList.toggle("is-active", isActive);

        const disc = discs[idx];
        if (disc) {
          if (isActive) {
            disc.style.transform = `translateX(58%) rotate(${((dY / 10) % 360).toFixed(1)}deg)`;
          } else {
            disc.style.transform = `translateX(0%) rotate(0deg)`;
          }
        }
      });

      if (activeFilmIndex !== lastIndex) {
        lastIndex = activeFilmIndex;
        const label = `0${activeFilmIndex + 1} // 0${numShows}`;
        if (counter) counter.textContent = label;
        if (chromeNo) chromeNo.textContent = `CRATE REF [${label}]`;
      }
    };

    const requestRender = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      measure();
      lastIndex = -1;
      requestRender();
    };

    const handleReducedChange = () => {
      syncReduced();
      measure();
      lastIndex = -1;
      requestRender();
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", handleResize);
    reducedMotion.addEventListener("change", handleReducedChange);

    requestRender();

    registerCleanup(() => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", handleResize);
      reducedMotion.removeEventListener("change", handleReducedChange);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    });
  });

  const totalSets = 5;
  const allPanelsData: Array<{
    movie: Movie;
    filmIndex: number;
    isClone: boolean;
    setNumber: number;
  }> = [];

  for (let s = 0; s < totalSets; s++) {
    shows.forEach((movie, mIdx) => {
      allPanelsData.push({
        movie,
        filmIndex: mIdx,
        isClone: s !== 2,
        setNumber: s,
      });
    });
  }

  return `
    <section id="now-showing" class="now-showing container" aria-label="A24 Physical Film Crate">
      <header class="crate__section-head">
        <div class="crate__title-group">
          <h2 class="crate__heading">THE ARCHIVE CRATE // CONTINUOUS REEL</h2>
          <p class="crate__subheading">
            Browse ${shows.length} physical vinyl jackets & celluloid prints. Select any feature to inspect auditorium seating.
          </p>
        </div>
        <div class="crate__counter-wrap">
          <span class="crate__counter" aria-live="polite">01 // 0${shows.length}</span>
          <span class="crate__counter-label" aria-hidden="true">ACTIVE REEL</span>
        </div>
      </header>

      <div class="crate__sequence" style="--panel-count: ${shows.length}">
        <div class="crate__sticky">
          <div class="crate__chrome crate__chrome--top">
            <span class="crate__chrome-studio">SPOTSHOW DIGITAL ARCHIVE</span>
            <span class="crate__chrome-no" aria-hidden="true">CRATE REF [01 // 0${shows.length}]</span>
            <span class="crate__chrome-hint">SCROLL OR DRAG TO ROTATE CRATE</span>
          </div>

          <div class="crate__viewport">
            <div class="crate__track">
              ${allPanelsData
                .map(({ movie, filmIndex, isClone }) => {
                  const poster =
                    moviePosters[movie.movieName] ?? moviePosters.default;
                  const metadata =
                    FILM_METADATA[movie.movieName] ?? DEFAULT_METADATA;

                  const d = new Date(movie.showDate);
                  const dateFormatted = isNaN(d.getTime())
                    ? String(movie.showDate)
                    : d.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                  const timeFormatted = isNaN(d.getTime())
                    ? "18:00"
                    : d.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      });

                  return `
                    <article
                      class="crate__panel crate__panel--${filmIndex + 1} ${isClone ? "crate__panel--clone" : ""}"
                      aria-label="${movie.movieName}"
                    >
                      <!-- 1. Physical Sleeve & Sliding Vinyl Disc -->
                      <div class="crate__sleeve-wrap">
                        <div class="crate__jacket">
                          <img
                            class="crate__poster"
                            src="${poster}"
                            alt="${movie.movieName} Poster"
                            loading="lazy"
                          />
                          <div class="crate__jacket-spine" aria-hidden="true">
                            <span>SPOTSHOW ARCHIVE // ${metadata.format}</span>
                          </div>
                        </div>

                        <!-- Physical grooved vinyl record -->
                        <div class="crate__disc" aria-hidden="true">
                          <div class="crate__disc-grooves"></div>
                          <div class="crate__disc-center">
                            <span class="crate__disc-rpm">33⅓ RPM</span>
                            <span class="crate__disc-brand">SPOTSHOW</span>
                            <span class="crate__disc-code">SS-2030-0${filmIndex + 1}</span>
                          </div>
                        </div>
                      </div>

                      <!-- 2. Archival Typographic Dossier -->
                      <div class="crate__dossier">
                        <div class="crate__meta-header">
                          <span class="crate__index-tag">[0${filmIndex + 1} / 0${shows.length}]</span>
                          <span class="crate__format-pill">${metadata.format}</span>
                          <span class="crate__date-pill">${dateFormatted} · ${timeFormatted}</span>
                        </div>

                        <h3 class="crate__film-title">${movie.movieName}</h3>

                        <blockquote class="crate__quote">
                          <p class="crate__quote-text">“${metadata.quote}”</p>
                          <cite class="crate__quote-author">— ${metadata.critic}</cite>
                        </blockquote>

                        <dl class="crate__spec-table">
                          <div class="crate__spec-row">
                            <dt>DIRECTOR</dt>
                            <dd>${metadata.director}</dd>
                          </div>
                          <div class="crate__spec-row">
                            <dt>ASPECT RATIO</dt>
                            <dd>${metadata.aspect}</dd>
                          </div>
                          <div class="crate__spec-row">
                            <dt>SOUNDTRACK</dt>
                            <dd>${metadata.audio}</dd>
                          </div>
                          <div class="crate__spec-row">
                            <dt>SEATS & ADMIT</dt>
                            <dd>${movie.totalSeats} SEATS · ₹${SEAT_PRICE}</dd>
                          </div>
                        </dl>

                        <div class="crate__action-wrap">
                          <a
                            class="crate__cta"
                            href="/shows/${movie.id}"
                            data-route="/shows/${movie.id}"
                            aria-label="Reserve seats for ${movie.movieName}"
                          >
                            RESERVE AUDITORIUM SEATS →
                          </a>
                        </div>
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>
          </div>

          <div class="crate__chrome crate__chrome--bottom">
            <span>AUDITORIUM SPEC: KODAK 70MM / BARCO DUAL LASER</span>
            <span class="crate__chrome-center">AUTHENTIC ANALOG SEAT MAP // 100 SEATS</span>
            <span>ALL TICKETS ₹${SEAT_PRICE} · ZERO SURCHARGES</span>
          </div>
        </div>
      </div>
    </section>
  `;
}
