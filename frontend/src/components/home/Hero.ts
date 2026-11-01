import { fetchShows } from "../../services/movie.service";
import { moviePosters } from "../../utils/moviePosters";
import { SEAT_PRICE } from "../../utils/booking.utils";
import { registerCleanup } from "../../utils/lifecycle";
import type { Movie } from "../../types/movie";

/*
 * Hero — SpotShow Object-Led Cinema Archive Hero
 *
 * Autonomous animated spatial composition featuring physical circular film discs
 * suspended in a tactile archival gallery space. Operates autonomously with continuous
 * organic drift and periodic focus evolution, fully complemented by direct user interaction.
 */

export interface HeroMovieData {
  id: string;
  name: string;
  dateStr: string;
  seatsStr: string;
  poster: string;
  indexStr: string;
}

export const DEFAULT_MOVIES_DATA: HeroMovieData[] = [
  {
    id: "a655588c-6b9c-421a-a8bc-f24649301764",
    name: "Spider-Man: Brand New Day",
    dateStr: "Thu, 15 Aug 2030 · 18:00",
    seatsStr: `₹${SEAT_PRICE} · 100 Seats Total`,
    poster: "/images/spiderman-brand-new-day.jpg",
    indexStr: "[01 // 04]",
  },
  {
    id: "989cfd20-ae3f-4ac1-81e6-b78d7da9480e",
    name: "Avengers: Doomsday",
    dateStr: "Fri, 16 Aug 2030 · 18:00",
    seatsStr: `₹${SEAT_PRICE} · 100 Seats Total`,
    poster: "/images/avengers-doomsday.jpg",
    indexStr: "[02 // 04]",
  },
  {
    id: "6be8a59b-193a-4f92-9458-af0f07ab7a64",
    name: "Mahavatar Narasimha",
    dateStr: "Sat, 17 Aug 2030 · 18:00",
    seatsStr: `₹${SEAT_PRICE} · 100 Seats Total`,
    poster: "/images/mahavatar-narasimha.png",
    indexStr: "[03 // 04]",
  },
  {
    id: "9f6be93b-1909-4364-8207-05816c2fa7ad",
    name: "Mahavatar Parshuram",
    dateStr: "Sun, 18 Aug 2030 · 18:00",
    seatsStr: `₹${SEAT_PRICE} · 100 Seats Total`,
    poster: "/images/mahavatar-parshuram.png",
    indexStr: "[04 // 04]",
  },
];

const DESKTOP_SLOTS = [
  // Slot 0: Active Foreground Focus (Center-Left prominent, sharpest focus)
  { x: 90,  y: 40,  z: 50,  rotY: -3,  rotZ: -1, scale: 1.05,  shadowAlpha: 0.32, opacity: 1.0 },
  // Slot 1: Mid-Right Overlap (Tucked behind Active right edge)
  { x: 270, y: 50,  z: 15,  rotY: -14, rotZ: 3,  scale: 0.90,  shadowAlpha: 0.22, opacity: 0.94 },
  // Slot 2: Deep Right Layer (Tucked behind Slot 1 right edge)
  { x: 430, y: 75,  z: -30, rotY: -20, rotZ: -3, scale: 0.775, shadowAlpha: 0.16, opacity: 0.80 },
  // Slot 3: Left Shoulder Peeking (Tucked behind Active left edge)
  { x: 0,   y: 70,  z: -5,  rotY: 14,  rotZ: -3, scale: 0.85,  shadowAlpha: 0.20, opacity: 0.88 },
];

const HARMONICS = [
  { fx1: 0.00062, fy1: 0.00078, fx2: 0.00115, fy2: 0.00094, ax: 4.0, ay: 5.0, aRotZ: 1.5, aRotY: 1.2, phX: 0.0, phY: 1.2 },
  { fx1: 0.00071, fy1: 0.00085, fx2: 0.00122, fy2: 0.00108, ax: 3.5, ay: 4.5, aRotZ: 1.8, aRotY: 1.0, phX: 2.1, phY: 0.5 },
  { fx1: 0.00055, fy1: 0.00069, fx2: 0.00098, fy2: 0.00082, ax: 4.5, ay: 4.0, aRotZ: 1.2, aRotY: 0.9, phX: 4.3, phY: 2.7 },
  { fx1: 0.00068, fy1: 0.00074, fx2: 0.00105, fy2: 0.00091, ax: 3.8, ay: 5.5, aRotZ: 1.6, aRotY: 1.1, phX: 1.5, phY: 3.9 },
];

export async function Hero() {
  let moviesData = DEFAULT_MOVIES_DATA;

  try {
    const shows = await fetchShows();
    if (shows && shows.length >= 4) {
      moviesData = shows.slice(0, 4).map((m: Movie, idx: number) => {
        const d = new Date(m.showDate);
        const dateFormatted = !isNaN(d.getTime())
          ? d.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            }) + " · 18:00"
          : "August 2030 · 18:00";

        const poster = moviePosters[m.movieName] ?? moviePosters.default;

        return {
          id: m.id,
          name: m.movieName,
          dateStr: dateFormatted,
          seatsStr: `₹${SEAT_PRICE} · ${m.totalSeats} Seats Total`,
          poster,
          indexStr: `[0${idx + 1} // 0${shows.length}]`,
        };
      });
    }
  } catch (err) {
    console.warn("Using default curated archive movies:", err);
  }

  // Trigger autonomous engine mount with retry guarantee
  setTimeout(() => {
    initHeroAutonomousEngine(moviesData);
  }, 20);

  const firstMovie = moviesData[0];

  return `
    <section class="hero-archival" id="hero-archival" aria-label="SpotShow Object-Led Cinema Archive">
      <div class="hero-archival__inner">
        <!-- Top Exhibition Telemetry Masthead (No duplicate brand) -->
        <header class="hero-archival__masthead">
          <div class="hero-archival__brand">
            <span class="hero-archival__brand-tag">CURATED 2030 ARCHIVAL SELECTION</span>
          </div>
          <div class="hero-archival__meta-center">
            <span>LIMITED THEATRICAL RUN</span>
            <span class="hero-archival__meta-dot" aria-hidden="true">/</span>
            <span>4 FEATURE RELEASES</span>
          </div>
          <div class="hero-archival__meta-right">
            <span>ADMISSION <strong class="hero-archival__price">₹${SEAT_PRICE}</strong></span>
            <span class="hero-archival__meta-dot" aria-hidden="true">/</span>
            <button
              type="button"
              class="hero-archival__replay-btn"
              data-action="replay-preloader"
              title="Replay Cinema Archive Preloader"
            >
              INTRO ↺
            </button>
          </div>
        </header>

        <!-- Main Spatial Stage -->
        <div class="hero-archival__stage">
          <!-- Curatorial Metadata Panel -->
          <div class="hero-archival__curation">
            <div class="hero-archival__badge-row">
              <span class="hero-archival__badge-dot" aria-hidden="true"></span>
              <span id="hero-curation-index" class="hero-archival__badge-index">${firstMovie.indexStr} NOW EXHIBITING</span>
              <span id="hero-curation-timer" class="hero-archival__timer-pill">NEXT IN 6S</span>
            </div>

            <div class="hero-archival__title-wrap">
              <h1 class="hero-archival__title" id="hero-curation-title">
                ${firstMovie.name}
              </h1>
            </div>

            <dl class="hero-archival__meta-grid">
              <div class="hero-archival__meta-item">
                <dt>SCREENING DATE</dt>
                <dd id="hero-curation-date">${firstMovie.dateStr}</dd>
              </div>
              <div class="hero-archival__meta-item">
                <dt>ADMISSION & SEATING</dt>
                <dd id="hero-curation-seats">${firstMovie.seatsStr}</dd>
              </div>
            </dl>

            <div class="hero-archival__cta-group">
              <a
                href="/shows/${firstMovie.id}"
                data-route="/shows/${firstMovie.id}"
                class="hero-archival__cta"
                id="hero-curation-btn"
                aria-label="Reserve seats for ${firstMovie.name}"
              >
                RESERVE AUDITORIUM SEATS →
              </a>
              <span class="hero-archival__status-hint" id="hero-status-hint">
                Hover to pause · Click disc to inspect
              </span>
            </div>
          </div>

          <!-- 3D Spatial Discs Cluster -->
          <div class="hero-archival__discs-viewport" id="hero-discs-viewport" aria-hidden="true">
            <div class="hero-archival__discs-cluster">
              ${moviesData
                .map((m, idx) => `
                  <div
                    class="cinema-disc cinema-disc--slot-${idx}"
                    id="hero-disc-${idx}"
                    data-movie-idx="${idx}"
                    role="button"
                    tabindex="0"
                    aria-label="Select feature: ${m.name}"
                  >
                    <img
                      class="cinema-disc__artwork"
                      src="${m.poster}"
                      alt="${m.name} Circular Artwork"
                      loading="eager"
                    />
                    <div class="cinema-disc__spindle">
                      <div class="cinema-disc__hole"></div>
                    </div>
                    <div class="cinema-disc__rim"></div>
                    <div class="cinema-disc__sheen"></div>
                  </div>
                `)
                .join("")}
            </div>
          </div>
        </div>

        <!-- Mobile Optimized Viewport -->
        <div class="hero-archival__mobile-viewport">
          <div class="hero-archival__mobile-discs">
            <div class="hero-archival__m-disc hero-archival__m-disc--left" id="hero-m-disc-left">
              <img id="hero-m-img-left" src="${moviesData[3].poster}" alt="Previous Film" />
              <div class="cinema-disc__spindle"><div class="cinema-disc__hole"></div></div>
            </div>
            <div class="hero-archival__m-disc hero-archival__m-disc--active" id="hero-m-disc-active">
              <img id="hero-m-img-active" src="${firstMovie.poster}" alt="Active Film" />
              <div class="cinema-disc__spindle"><div class="cinema-disc__hole"></div></div>
              <div class="cinema-disc__rim"></div>
              <div class="cinema-disc__sheen"></div>
            </div>
            <div class="hero-archival__m-disc hero-archival__m-disc--right" id="hero-m-disc-right">
              <img id="hero-m-img-right" src="${moviesData[1].poster}" alt="Next Film" />
              <div class="cinema-disc__spindle"><div class="cinema-disc__hole"></div></div>
            </div>
          </div>

          <div class="hero-archival__mobile-pips">
            ${moviesData.map((_, i) => `<span class="hero-archival__m-pip ${i === 0 ? "is-active" : ""}" data-m-pip="${i}"></span>`).join("")}
          </div>
        </div>

        <!-- Footer Navigation & Telemetry -->
        <footer class="hero-archival__footer">
          <div class="hero-archival__footer-item">
            <span>ARCHIVE REFERENCE: SPOTSHOW-2030-SEASON</span>
          </div>

          <div class="hero-archival__selectors">
            <span class="hero-archival__selectors-label">DIRECT FOCUS:</span>
            ${moviesData
              .map(
                (m, i) => `
                  <button
                    type="button"
                    class="hero-archival__dot-btn ${i === 0 ? "is-active" : ""}"
                    data-movie-select="${i}"
                  >
                    [0${i + 1}] ${m.name.split(":")[0].toUpperCase()}
                  </button>
                `
              )
              .join("")}
          </div>

          <div class="hero-archival__footer-item hero-archival__footer-item--right">
            <span class="hero-archival__curation-tag">4 CURATED EDITIONS // THEATRICAL 2030</span>
          </div>
        </footer>
      </div>
    </section>
  `;
}

export function initHeroAutonomousEngine(movies?: HeroMovieData[]) {
  const dataset = movies ?? DEFAULT_MOVIES_DATA;
  const container = document.getElementById("hero-archival");
  const disc0 = document.getElementById("hero-disc-0");

  // DOM mount retry queue: ensures engine always mounts once innerHTML is rendered
  if (!container || !disc0) {
    let retries = 0;
    const retry = () => {
      retries++;
      const c = document.getElementById("hero-archival");
      const d = document.getElementById("hero-disc-0");
      if (c && d) {
        initHeroAutonomousEngine(dataset);
      } else if (retries < 60) {
        requestAnimationFrame(retry);
      }
    };
    requestAnimationFrame(retry);
    return;
  }

  const titleEl = document.getElementById("hero-curation-title");
  const dateEl = document.getElementById("hero-curation-date");
  const seatsEl = document.getElementById("hero-curation-seats");
  const indexEl = document.getElementById("hero-curation-index");
  const timerPill = document.getElementById("hero-curation-timer");
  const statusHint = document.getElementById("hero-status-hint");
  const ctaBtn = document.getElementById("hero-curation-btn") as HTMLAnchorElement | null;
  const dotBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-movie-select]"));

  // Mobile elements
  const mImgLeft = document.getElementById("hero-m-img-left") as HTMLImageElement | null;
  const mImgActive = document.getElementById("hero-m-img-active") as HTMLImageElement | null;
  const mImgRight = document.getElementById("hero-m-img-right") as HTMLImageElement | null;
  const mDiscLeft = document.getElementById("hero-m-disc-left");
  const mDiscActive = document.getElementById("hero-m-disc-active");
  const mDiscRight = document.getElementById("hero-m-disc-right");
  const mPips = Array.from(document.querySelectorAll<HTMLElement>("[data-m-pip]"));

  const discEls = dataset.map((_, i) => document.getElementById(`hero-disc-${i}`));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Discrete state per disc for smooth lerp
  const discStates = DESKTOP_SLOTS.map((s) => ({
    x: s.x,
    y: s.y,
    z: s.z,
    rotY: s.rotY,
    rotZ: s.rotZ,
    scale: s.scale,
    opacity: s.opacity,
  }));

  let activeIndex = 0;
  let isPaused = false;
  let timeRemainingMs = 6000;
  const CYCLE_DURATION_MS = 6000;
  let lastTimestamp = performance.now();
  let idleTimeoutId = 0;
  let rafId = 0;

  function updateCurationDisplay(idx: number) {
    const movie = dataset[idx];
    if (!movie) return;

    if (titleEl && dateEl && seatsEl && indexEl && ctaBtn) {
      titleEl.textContent = movie.name;
      dateEl.textContent = movie.dateStr;
      seatsEl.textContent = movie.seatsStr;
      indexEl.textContent = `${movie.indexStr} NOW EXHIBITING`;
      ctaBtn.href = `/shows/${movie.id}`;
      ctaBtn.setAttribute("data-route", `/shows/${movie.id}`);
      ctaBtn.setAttribute("aria-label", `Reserve seats for ${movie.name}`);

      titleEl.style.opacity = "1";
      titleEl.style.transform = "translateY(0)";
      dateEl.style.opacity = "1";
      seatsEl.style.opacity = "1";
    }

    dotBtns.forEach((btn, i) => {
      btn.classList.toggle("is-active", i === idx);
    });

    // Mobile sync
    const prevIdx = (idx - 1 + 4) % 4;
    const nextIdx = (idx + 1) % 4;

    if (mImgActive && mImgLeft && mImgRight) {
      mImgActive.src = movie.poster;
      mImgLeft.src = dataset[prevIdx].poster;
      mImgRight.src = dataset[nextIdx].poster;
    }

    mPips.forEach((pip, i) => {
      pip.classList.toggle("is-active", i === idx);
    });
  }

  function setActiveMovie(newIndex: number, isManual = true) {
    activeIndex = (newIndex + 4) % 4;
    timeRemainingMs = CYCLE_DURATION_MS;

    updateCurationDisplay(activeIndex);

    if (isManual) {
      isPaused = true;
      if (statusHint) statusHint.textContent = "Manual Focus Active (Auto resumes in 8s)";

      clearTimeout(idleTimeoutId);
      idleTimeoutId = window.setTimeout(() => {
        isPaused = false;
        if (statusHint) statusHint.textContent = "Hover to pause · Click disc to inspect";
      }, 8000);
    }
  }

  // Hover to pause
  const handleMouseEnter = () => {
    isPaused = true;
    if (statusHint) statusHint.textContent = "Hover Active (Progression Paused)";
  };

  const handleMouseLeave = () => {
    isPaused = false;
    if (statusHint) statusHint.textContent = "Hover to pause · Click disc to inspect";
  };

  container.addEventListener("mouseenter", handleMouseEnter);
  container.addEventListener("mouseleave", handleMouseLeave);

  // Click on discs
  const discClickHandlers = discEls.map((disc, idx) => {
    if (!disc) return null;
    const handler = () => setActiveMovie(idx, true);
    disc.addEventListener("click", handler);
    disc.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveMovie(idx, true);
      }
    });
    return { disc, handler };
  });

  // Click on selector buttons
  const dotClickHandlers = dotBtns.map((btn, idx) => {
    const handler = () => setActiveMovie(idx, true);
    btn.addEventListener("click", handler);
    return { btn, handler };
  });

  // Mobile disc clicks
  const handleMLeft = () => setActiveMovie((activeIndex - 1 + 4) % 4, true);
  const handleMRight = () => setActiveMovie((activeIndex + 1) % 4, true);
  mDiscLeft?.addEventListener("click", handleMLeft);
  mDiscRight?.addEventListener("click", handleMRight);

  // Mobile pip clicks
  mPips.forEach((pip, idx) => {
    pip.addEventListener("click", () => setActiveMovie(idx, true));
  });

  // Keyboard navigation
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      setActiveMovie((activeIndex + 1) % 4, true);
    } else if (e.key === "ArrowLeft") {
      setActiveMovie((activeIndex - 1 + 4) % 4, true);
    }
  };
  window.addEventListener("keydown", handleKeydown);

  // Action button handlers
  const replayBtn = document.querySelector<HTMLButtonElement>('[data-action="replay-preloader"]');

  const handleReplay = () => {
    sessionStorage.removeItem("spotshow_preloader_seen");
    window.location.reload();
  };

  replayBtn?.addEventListener("click", handleReplay);

  // Initial display sync
  updateCurationDisplay(0);

  // Continuous Autonomous Render Loop
  function renderFrame(timestamp: number) {
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // 1. Advance focus progression
    if (!isPaused && !prefersReduced) {
      timeRemainingMs -= delta;
      const secondsLeft = Math.max(1, Math.ceil(timeRemainingMs / 1000));
      if (timerPill) timerPill.textContent = `NEXT IN ${secondsLeft}S`;

      if (timeRemainingMs <= 0) {
        setActiveMovie((activeIndex + 1) % 4, false);
      }
    }

    // 2. Physics & organic micro-drift for all 4 desktop discs
    discEls.forEach((disc, i) => {
      if (!disc) return;
      const slotIdx = (i - activeIndex + 4) % 4;
      const targetSlot = DESKTOP_SLOTS[slotIdx];
      const state = discStates[i];
      const h = HARMONICS[i];

      const driftX = h.ax * Math.sin(timestamp * h.fx1 + h.phX) + (h.ax * 0.4) * Math.cos(timestamp * h.fx2);
      const driftY = h.ay * Math.cos(timestamp * h.fy1 + h.phY) + (h.ay * 0.4) * Math.sin(timestamp * h.fy2);
      const driftRotZ = h.aRotZ * Math.sin(timestamp * h.fx1 * 0.8 + h.phX);
      const driftRotY = h.aRotY * Math.cos(timestamp * h.fy1 * 0.9 + h.phY);

      const targetX = targetSlot.x + driftX;
      const targetY = targetSlot.y + driftY;
      const targetZ = targetSlot.z;
      const targetRotY = targetSlot.rotY + driftRotY;
      const targetRotZ = targetSlot.rotZ + driftRotZ;
      const targetScale = targetSlot.scale;
      const targetOpacity = targetSlot.opacity;

      const lerp = prefersReduced ? 1.0 : 0.055;
      state.x += (targetX - state.x) * lerp;
      state.y += (targetY - state.y) * lerp;
      state.z += (targetZ - state.z) * lerp;
      state.rotY += (targetRotY - state.rotY) * lerp;
      state.rotZ += (targetRotZ - state.rotZ) * lerp;
      state.scale += (targetScale - state.scale) * lerp;
      state.opacity += (targetOpacity - state.opacity) * lerp;

      // Continuous dynamic z-index tied to interpolated depth, avoiding layer pop
      disc.style.zIndex = String(Math.round(state.z + 50));
      disc.style.opacity = state.opacity.toFixed(3);
      disc.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, ${state.z.toFixed(2)}px) perspective(1400px) rotateY(${state.rotY.toFixed(2)}deg) rotateZ(${state.rotZ.toFixed(2)}deg) scale(${state.scale.toFixed(3)})`;
      disc.style.boxShadow = `0 35px 80px -15px rgba(20, 20, 25, ${targetSlot.shadowAlpha}), 0 12px 28px -8px rgba(0, 0, 0, 0.15)`;
    });

    // 3. Mobile floating drift
    if (!prefersReduced && mDiscActive && mDiscLeft && mDiscRight) {
      const mobT = timestamp * 0.001;
      const mActiveY = Math.sin(mobT * 1.2) * 5;
      const mActiveRot = Math.sin(mobT * 0.8) * 1.5;
      mDiscActive.style.transform = `translateY(${mActiveY.toFixed(2)}px) rotate(${mActiveRot.toFixed(2)}deg)`;

      const mLeftRotY = 24 + Math.sin(mobT * 1.0) * 3;
      const mLeftY = Math.cos(mobT * 1.1) * 4;
      mDiscLeft.style.transform = `translateY(${mLeftY.toFixed(2)}px) perspective(900px) rotateY(${mLeftRotY.toFixed(2)}deg) scale(0.85)`;

      const mRightRotY = -24 + Math.cos(mobT * 0.9) * 3;
      const mRightY = Math.sin(mobT * 1.3) * 4;
      mDiscRight.style.transform = `translateY(${mRightY.toFixed(2)}px) perspective(900px) rotateY(${mRightRotY.toFixed(2)}deg) scale(0.85)`;
    }

    rafId = requestAnimationFrame(renderFrame);
  }

  rafId = requestAnimationFrame(renderFrame);

  // Lifecycle cleanup
  registerCleanup(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (idleTimeoutId) clearTimeout(idleTimeoutId);
    container.removeEventListener("mouseenter", handleMouseEnter);
    container.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("keydown", handleKeydown);

    discClickHandlers.forEach((h) => {
      if (h) h.disc.removeEventListener("click", h.handler);
    });

    dotClickHandlers.forEach((h) => {
      h.btn.removeEventListener("click", h.handler);
    });

    mDiscLeft?.removeEventListener("click", handleMLeft);
    mDiscRight?.removeEventListener("click", handleMRight);
    replayBtn?.removeEventListener("click", handleReplay);
  });
}
