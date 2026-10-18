import { fetchShows } from "../../services/movie.service";
import { moviePosters } from "../../utils/moviePosters";
import { registerCleanup } from "../../utils/lifecycle";
import { SEAT_PRICE } from "../../utils/booking.utils";

function getWavePaths(cycleProgress: number) {
  // Wave phase based on cycle progress (continuous travelling wave with period 1.0)
  const p = cycleProgress * Math.PI * 4;

  // Top wave control points (normalized 0 to 1 for clip-path)
  const y0_t = 0.14 + Math.sin(p) * 0.025;
  const y1_t = 0.26 + Math.sin(p + 1.2) * 0.035;
  const y2_t = 0.13 + Math.sin(p + 2.5) * 0.03;
  const y3_t = 0.20 + Math.sin(p + 3.8) * 0.025;

  // Bottom wave control points (normalized 0 to 1 for clip-path)
  const y0_b = 0.86 + Math.cos(p) * 0.025;
  const y1_b = 0.90 + Math.cos(p + 1.2) * 0.03;
  const y2_b = 0.74 + Math.cos(p + 2.5) * 0.035;
  const y3_b = 0.84 + Math.cos(p + 3.8) * 0.025;

  const clipD =
    `M 0 ${y0_t.toFixed(4)} ` +
    `C 0.25 ${y0_t.toFixed(4)}, 0.35 ${y1_t.toFixed(4)}, 0.50 ${((y1_t + y2_t) / 2).toFixed(4)} ` +
    `C 0.65 ${y2_t.toFixed(4)}, 0.80 ${y2_t.toFixed(4)}, 1.0 ${y3_t.toFixed(4)} ` +
    `L 1.0 ${y3_b.toFixed(4)} ` +
    `C 0.80 ${y2_b.toFixed(4)}, 0.65 ${y2_b.toFixed(4)}, 0.50 ${((y1_b + y2_b) / 2).toFixed(4)} ` +
    `C 0.35 ${y1_b.toFixed(4)}, 0.25 ${y0_b.toFixed(4)}, 0 ${y0_b.toFixed(4)} Z`;

  // Hairline strokes (1000 x 600 coordinate space)
  const topHairlineD =
    `M 0 ${(y0_t * 600).toFixed(1)} ` +
    `C 250 ${(y0_t * 600).toFixed(1)}, 350 ${(y1_t * 600).toFixed(1)}, 500 ${(((y1_t + y2_t) / 2) * 600).toFixed(1)} ` +
    `C 650 ${(y2_t * 600).toFixed(1)}, 800 ${(y2_t * 600).toFixed(1)}, 1000 ${(y3_t * 600).toFixed(1)}`;

  const botHairlineD =
    `M 0 ${(y0_b * 600).toFixed(1)} ` +
    `C 250 ${(y0_b * 600).toFixed(1)}, 350 ${(y1_b * 600).toFixed(1)}, 500 ${(((y1_b + y2_b) / 2) * 600).toFixed(1)} ` +
    `C 650 ${(y2_b * 600).toFixed(1)}, 800 ${(y2_b * 600).toFixed(1)}, 1000 ${(y3_b * 600).toFixed(1)}`;

  return { clipD, topHairlineD, botHairlineD };
}

export async function NowShowing() {
  let shows = [];

  try {
    shows = await fetchShows();
  } catch {
    return `
      <section id="now-showing" class="now-showing container">
        <div class="section-head">
          <div>
            <p class="eyebrow">The Programme</p>
            <h2>Now screening</h2>
          </div>
        </div>
        <div class="empty-state" role="alert">
          Could not load shows. Please try again.
        </div>
      </section>
    `;
  }

  if (!shows.length) {
    return `
      <section id="now-showing" class="now-showing container">
        <div class="section-head">
          <div>
            <p class="eyebrow">The Programme</p>
            <h2>Now screening</h2>
          </div>
        </div>
        <div class="empty-state">No screenings scheduled yet.</div>
      </section>
    `;
  }

  /*
   * Genuinely Infinite Cinema Reel ("SpotShow").
   *
   * Continuous multi-buffer horizontal reel with curved ribbon boundary,
   * subtle 3D perspective warp, and seamless bidirectional scroll wrapping.
   *
   * Forward: 1 -> 2 -> 3 -> 4 -> 1 -> 2 -> 3 -> 4 (indefinite loops)
   * Backward: 4 -> 3 -> 2 -> 1 -> 4 -> 3 -> 2 -> 1 (indefinite loops)
   */
  setTimeout(() => {
    const section = document.querySelector<HTMLElement>("#now-showing");
    const sequence = section?.querySelector<HTMLElement>(".gallery__sequence");
    const sticky = section?.querySelector<HTMLElement>(".gallery__sticky");
    const viewport = section?.querySelector<HTMLElement>(".gallery__viewport");
    const track = section?.querySelector<HTMLElement>(".gallery__track");
    const panels = Array.from(
      section?.querySelectorAll<HTMLElement>(".gallery__panel") ?? [],
    );
    const arts = panels.map((panel) =>
      panel.querySelector<HTMLElement>(".gallery__art"),
    );
    const fill = section?.querySelector<HTMLElement>(".gallery__progress-fill");
    const counter = section?.querySelector<HTMLElement>(".gallery__counter");
    const chromeNo = section?.querySelector<HTMLElement>(".gallery__chrome-no");

    const clipPathEl = section?.querySelector<SVGPathElement>("#gallery-wave-clip-path");
    const topHairlineEl = section?.querySelector<SVGPathElement>("#gallery-wave-hairline-top");
    const botHairlineEl = section?.querySelector<SVGPathElement>("#gallery-wave-hairline-bottom");

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

    // Cycle geometry measurements
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

      // Measure width of 1 complete set of 4 panels
      cycleWidth = 0;
      for (let i = 0; i < numShows; i++) {
        cycleWidth += panels[i]?.offsetWidth ?? 0;
      }
      if (cycleWidth <= 0) {
        cycleWidth = viewportWidth * 3;
      }

      // Height of 1 cycle in vertical scroll
      cycleScroll = Math.max(window.innerHeight * 1.5, 1400);

      // Total sequence runway height: 6 full cycles
      sequence.style.height = `${cycleScroll * 6}px`;

      // Start of pinned range
      const seqRect = sequence.getBoundingClientRect();
      pinStart = seqRect.top + window.scrollY - pinnedTop;

      // The canonical primary set is Set 2 (film index 2 * numShows = 8)
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
        panels.forEach((panel, index) => {
          panel.style.transform = "";
          panel.classList.remove("is-active");
          const art = arts[index];
          if (art) art.style.transform = "";
        });
        return;
      }

      const currentY = window.scrollY;
      const dY = hasEnteredLoop ? currentY - pinStart : Math.max(0, currentY - pinStart);

      // Seamless bidirectional wraparound:
      // When scrolling forward past 2 cycles: wrap back by 1 cycle
      // When scrolling backward below 0 (and after having entered the loop): wrap forward by 1 cycle
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

      // Normalized progress within the current cycle [0..1)
      const cycleProgress = (((dY % cycleScroll) + cycleScroll) % cycleScroll) / cycleScroll;

      // 1. Horizontal track travel with exact modular translation
      const shift = centerShift + (dY / cycleScroll) * cycleWidth;
      track.style.transform = `translate3d(${-shift.toFixed(2)}px, 0, 0)`;

      // 2. Periodic wave boundary and hairline stroke update
      const { clipD, topHairlineD, botHairlineD } = getWavePaths(cycleProgress);
      if (clipPathEl) clipPathEl.setAttribute("d", clipD);
      if (topHairlineEl) topHairlineEl.setAttribute("d", topHairlineD);
      if (botHairlineEl) botHairlineEl.setAttribute("d", botHairlineD);

      // 3. Subtle 3D perspective warp and wave ripple across panels
      let closestDist = Infinity;
      let activePanelIdx = -1;
      let activeFilmIndex = 0;

      panels.forEach((panel, index) => {
        const art = arts[index];
        const rect = panel.getBoundingClientRect();
        const panelCenter = rect.left + rect.width / 2;
        const dist = Math.abs(panelCenter - vpCenter);

        if (dist < closestDist) {
          closestDist = dist;
          activePanelIdx = index;
          activeFilmIndex = index % numShows;
        }

        // Distance normalized by half-viewport (-1 left, 0 center, +1 right)
        const distance = (panelCenter - vpCenter) / (viewportWidth * 0.5);
        const abs = Math.abs(distance);

        // Periodic wave phase
        const phase = distance * 1.5 + cycleProgress * Math.PI * 2;
        const waveY = Math.sin(phase) * 8;
        const shearY = Math.cos(phase) * 1.4;
        const scaleY = 1 - Math.min(abs * 0.03, 0.06);

        panel.style.transform =
          `translate3d(0, ${waveY.toFixed(2)}px, 0) ` +
          `skewY(${shearY.toFixed(2)}deg) ` +
          `scaleY(${scaleY.toFixed(3)})`;

        if (art) {
          const rotateY = distance * -7;
          art.style.transform = `perspective(1100px) rotateY(${rotateY.toFixed(2)}deg)`;
        }
      });

      // 4. Update active panel state & ensure inactive panels do not intercept clicks
      panels.forEach((panel, idx) => {
        const isActive = idx === activePanelIdx;
        panel.classList.toggle("is-active", isActive);
      });

      // 5. Update index counter and progress fill
      if (activeFilmIndex !== lastIndex) {
        lastIndex = activeFilmIndex;
        const label = `${String(activeFilmIndex + 1).padStart(2, "0")} / ${String(numShows).padStart(2, "0")}`;

        if (counter) counter.textContent = label;
        if (chromeNo) chromeNo.textContent = `N° ${label}`;
      }

      if (fill) {
        fill.style.transform = `scaleX(${cycleProgress.toFixed(3)})`;
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

  const initialWave = getWavePaths(0);

  // Build multi-buffer reel panels: 5 sets of shows for continuous bidirectional loop
  // Sets 0..1: Preceding buffer
  // Sets 2..3: Canonical active sets
  // Set 4: Trailing buffer
  const totalSets = 5;
  const allPanelsData: Array<{
    movie: (typeof shows)[number];
    filmIndex: number;
    isClone: boolean;
    setNumber: number;
  }> = [];

  for (let s = 0; s < totalSets; s++) {
    shows.forEach((movie, mIdx) => {
      allPanelsData.push({
        movie,
        filmIndex: mIdx,
        isClone: s !== 2, // Set 2 is the canonical primary set
        setNumber: s,
      });
    });
  }

  const formats = [
    "70MM FILM · DOLBY ATMOS",
    "IMAX DUAL LASER · 12CH SOUND",
    "35MM CELLULOID · OPTICAL SOUND",
    "70MM ULTRA PANAVISION · ATMOS",
  ];

  return `
    <section id="now-showing" class="now-showing container" aria-label="Infinite Cinema Reel">
      <div class="section-head">
        <div>
          <p class="eyebrow">The Gallery</p>
          <h2>Continuous cinema</h2>
          <p class="section-sub">${shows.length} feature films ·</p>
        </div>
        <p class="gallery__counter" aria-live="polite">01 / ${String(shows.length).padStart(2, "0")}</p>
      </div>

      <div
        class="gallery__sequence"
        style="--panel-count: ${shows.length}"
      >
        <div class="gallery__sticky">
          <div class="gallery__chrome">
            <span>Now screening</span>
            <span class="gallery__chrome-no" aria-hidden="true">N° 01 / ${String(shows.length).padStart(2, "0")}</span>
          </div>

          <div class="gallery__viewport">
            <svg class="gallery__wave-defs" width="0" height="0" aria-hidden="true">
              <defs>
                <clipPath id="gallery-wave-clip" clipPathUnits="objectBoundingBox">
                  <path id="gallery-wave-clip-path" d="${initialWave.clipD}" />
                </clipPath>
              </defs>
            </svg>

            <div class="gallery__ribbon">
              <div class="gallery__track">
                ${allPanelsData
                  .map(({ movie, filmIndex, isClone }) => {
                    const poster =
                      moviePosters[movie.movieName] ?? moviePosters.default;
                    const d = new Date(movie.showDate);
                    const dateLabel = isNaN(d.getTime())
                      ? String(movie.showDate)
                      : d.toLocaleString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        });

                    const formatText = formats[filmIndex % formats.length];

                    return `
                      <article
                        class="gallery__panel gallery__panel--film-${filmIndex + 1} ${isClone ? "gallery__panel--clone" : ""}"
                        aria-label="${movie.movieName}"
                      >
                        <div class="gallery__art">
                          <img
                            class="gallery__art-fill"
                            src="${poster}"
                            alt=""
                            aria-hidden="true"
                          />
                          <img
                            class="gallery__poster"
                            src="${poster}"
                            alt="${movie.movieName}"
                            loading="lazy"
                          />
                        </div>

                        <div class="gallery__meta">
                          <div class="gallery__meta-head">
                            <p class="gallery__no" aria-hidden="true">
                              <span>N°</span>${String(filmIndex + 1).padStart(2, "0")}
                            </p>
                            <span class="gallery__format">${formatText}</span>
                          </div>

                          <h3 class="gallery__title">${movie.movieName}</h3>
                          <p class="gallery__details">${dateLabel} · ${movie.totalSeats} seats</p>

                          <div class="gallery__action">
                            <a
                              class="gallery__cta"
                              href="/shows/${movie.id}"
                              data-route="/shows/${movie.id}"
                              aria-label="Book tickets for ${movie.movieName}"
                            >
                              Book tickets
                            </a>
                            <span class="gallery__price">₹${SEAT_PRICE} a seat</span>
                          </div>
                        </div>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            </div>

            <svg class="gallery__wave-hairlines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
              <path id="gallery-wave-hairline-top" class="gallery__hairline gallery__hairline--top" vector-effect="non-scaling-stroke" d="${initialWave.topHairlineD}" />
              <path id="gallery-wave-hairline-bottom" class="gallery__hairline gallery__hairline--bottom" vector-effect="non-scaling-stroke" d="${initialWave.botHairlineD}" />
            </svg>
          </div>

          <div class="gallery__chrome gallery__chrome--bottom">
            <span>SpotShow Cinema</span>
            <span class="gallery__chrome-center">${shows.length} Feature Films · ₹${SEAT_PRICE} a seat</span>
            <span>Scroll to navigate</span>
          </div>

          <div class="gallery__progress" aria-hidden="true">
            <span class="gallery__progress-fill"></span>
          </div>
        </div>
      </div>
    </section>
  `;
}
