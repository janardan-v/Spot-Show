import { fetchShows } from "../../services/movie.service";
import { MovieCard } from "./MovieCard";
import { navigate } from "../../router";
import { registerCleanup } from "../../utils/lifecycle";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export async function NowShowing() {
  const shows = await fetchShows();
  const pairs = [];

  for (let index = 0; index < shows.length; index += 2) {
    pairs.push(shows.slice(index, index + 2));
  }

  setTimeout(() => {
    const section = document.querySelector<HTMLElement>("#now-showing");
    const sequence = section?.querySelector<HTMLElement>(".now-showing__sequence");
    const stage = section?.querySelector<HTMLElement>(".now-showing__stage");
    const steps = Array.from(
      section?.querySelectorAll<HTMLElement>(".now-showing__step") ?? [],
    );
    const pairElements = Array.from(
      section?.querySelectorAll<HTMLElement>(".now-showing__pair") ?? [],
    );

    if (!section || !sequence || !stage || !steps.length || !pairElements.length) {
      return;
    }

    /*
     * TRANSFORM-SAFE BOOKING INTERACTION
     *
     * The posters live inside a sticky 3D transformed scene. We compare the
     * actual pointer coordinates with the CURRENT viewport rectangle of the
     * active Book Tickets button, so interaction follows the visual poster at
     * every depth position.
     */
    let lastTouchNavigation = 0;
    let lastTouchRoute = "";

    const getActiveBookingButtonAtPoint = (
      clientX: number,
      clientY: number,
    ): HTMLButtonElement | HTMLAnchorElement | null => {
      const buttons = Array.from(
        section.querySelectorAll<
          HTMLButtonElement | HTMLAnchorElement
        >(
          '.now-showing__pair[aria-hidden="false"] .movie-card__button[data-route]',
        ),
      );

      const candidates = buttons
        .map((button) => {
          const rect = button.getBoundingClientRect();

          if (
            clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom ||
            rect.width <= 0 ||
            rect.height <= 0
          ) {
            return null;
          }

          const pair = button.closest<HTMLElement>(".now-showing__pair");
          const pairIndex = Number(pair?.dataset.pair ?? -1);

          return {
            button,
            pairIndex,
            area: rect.width * rect.height,
          };
        })
        .filter(
          (
            candidate,
          ): candidate is {
            button: HTMLButtonElement | HTMLAnchorElement;
            pairIndex: number;
            area: number;
          } => candidate !== null,
        )
        .sort((a, b) => {
          /*
           * When two pairs briefly overlap, prefer the later/deeper pair
           * that visually sits on top. If the pair index is identical, use
           * the smaller hit area as a tie-breaker.
           */
          if (a.pairIndex !== b.pairIndex) {
            return b.pairIndex - a.pairIndex;
          }

          return a.area - b.area;
        });

      return candidates[0]?.button ?? null;
    };

    const navigateFromPoint = (
      event: MouseEvent | PointerEvent,
      button: HTMLButtonElement | HTMLAnchorElement,
    ) => {
      const route = button.dataset.route;

      if (!route) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      navigate(route);
    };

    const handleGalleryPointerUp = (event: PointerEvent) => {
      if (
        event.pointerType !== "touch" &&
        event.pointerType !== "pen"
      ) {
        return;
      }

      const button = getActiveBookingButtonAtPoint(
        event.clientX,
        event.clientY,
      );

      if (!button) {
        return;
      }

      lastTouchNavigation = Date.now();
      lastTouchRoute = button.dataset.route ?? "";

      navigateFromPoint(event, button);
    };

    const handleGalleryDocumentClick = (event: MouseEvent) => {
      const button = getActiveBookingButtonAtPoint(
        event.clientX,
        event.clientY,
      );

      if (!button) {
        return;
      }

      const route = button.dataset.route ?? "";

      if (
        lastTouchRoute === route &&
        Date.now() - lastTouchNavigation < 700
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      navigateFromPoint(event, button);
    };

    document.addEventListener(
      "pointerup",
      handleGalleryPointerUp,
      true,
    );

    document.addEventListener(
      "click",
      handleGalleryDocumentClick,
      true,
    );

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 640px)");

    let rafId = 0;

    const renderGallery = () => {
      rafId = 0;

      const viewportCenter = window.scrollY + window.innerHeight * 0.48;

      /*
       * Choose the pair from the actual gallery sequence progress rather than
       * whichever invisible marker happens to be closest to the viewport.
       * This removes the "blank corridor" that can appear when the viewport is
       * between two markers and guarantees that the final pair owns the end of
       * the sequence.
       */
      const sequenceRect = sequence.getBoundingClientRect();
      const sequenceStart = sequenceRect.top + window.scrollY;
      const sequenceEnd =
        sequenceStart + Math.max(sequenceRect.height - stage.offsetHeight, 1);

      const sequenceProgress = clamp(
        (viewportCenter - sequenceStart) /
          Math.max(sequenceEnd - sequenceStart, 1),
        0,
        0.999999,
      );

      const activeIndex = Math.min(
        pairElements.length - 1,
        Math.floor(sequenceProgress * pairElements.length),
      );

      const activeStep = steps[activeIndex];
      const activeRect = activeStep?.getBoundingClientRect();
      const activeStart = activeRect
        ? activeRect.top + window.scrollY
        : window.scrollY;
      const activeLength = Math.max(activeRect?.height ?? 1, 1);

      const sceneProgress = clamp(
        (viewportCenter - activeStart) / activeLength,
        0,
        1,
      );

      section.style.setProperty(
        "--gallery-scene-progress",
        `${sceneProgress}`,
      );

      /*
       * Reduced motion:
       * show exactly one pair and keep it fully settled.
       */
      if (reducedMotion.matches) {
        pairElements.forEach((pair, index) => {
          const isActive = index === activeIndex;

          pair.style.setProperty("--gallery-progress", isActive ? "1" : "0");
          pair.style.setProperty(
            "--gallery-distance",
            isActive ? "0px" : "-900px",
          );
          pair.style.setProperty(
            "--gallery-opacity",
            isActive ? "1" : "0",
          );
          pair.style.setProperty(
            "--gallery-scale",
            isActive ? "1" : "0.55",
          );
          pair.style.setProperty("--gallery-rotate", "0deg");

          pair.classList.toggle("is-active", isActive);
          pair.setAttribute("aria-hidden", isActive ? "false" : "true");
          pair.style.pointerEvents = isActive ? "auto" : "none";
        });

        section.style.setProperty(
          "--gallery-active-index",
          `${activeIndex}`,
        );

        return;
      }

      /*
       * Mobile:
       * Use one continuous pair-space coordinate. The current pair approaches
       * the visitor through a short physical depth range, while the pair just
       * passed exits quickly. The overlap is deliberately brief and subtle:
       * it reads as walking past a wall installation rather than a cross-fade.
       */
      if (mobileQuery.matches) {
        const pairCount = Math.max(pairElements.length, 1);
        const galleryPosition = sequenceProgress * pairCount;
        const localProgress = clamp(
          galleryPosition - activeIndex,
          0,
          1,
        );

        const smoothstep = (value: number) =>
          value * value * (3 - 2 * value);

        const arrive = smoothstep(localProgress);

        pairElements.forEach((pair, index) => {
          const isActive = index === activeIndex;
          const isPrevious = index === activeIndex - 1;

          if (isActive) {
            /*
             * Keep the visitor close to the poster. The full arrival is only
             * about 180px of depth, so posters never disappear deep into the
             * corridor on a phone.
             */
            const distance = -120 + arrive * 120;
            const scale = 0.94 + arrive * 0.06;

            /*
             * Start the new pair gently, then become fully present quickly.
             * This also makes the last pair fully visible at the scroll limit.
             */
            const opacity = clamp(
              (localProgress - 0.08) / 0.42,
              0,
              1,
            );

            pair.style.setProperty(
              "--gallery-distance",
              `${distance}px`,
            );
            pair.style.setProperty(
              "--gallery-opacity",
              `${opacity}`,
            );
            pair.style.setProperty(
              "--gallery-scale",
              `${scale}`,
            );
            pair.style.setProperty(
              "--gallery-rotate",
              "0deg",
            );
            pair.style.setProperty(
              "--gallery-progress",
              `${localProgress}`,
            );
            pair.style.setProperty(
              "--gallery-x",
              "0px",
            );
          } else if (isPrevious) {
            /*
             * The passed pair moves a little closer and outward before
             * disappearing. Keep the handoff short so it feels physical,
             * not like two full pairs are layered together.
             */
            const exitProgress = clamp(
              (localProgress - 0.28) / 0.24,
              0,
              1,
            );

            const distance = exitProgress * 150;
            const scale = 1 + exitProgress * 0.08;
            const opacity = 1 - exitProgress;

            pair.style.setProperty(
              "--gallery-distance",
              `${distance}px`,
            );
            pair.style.setProperty(
              "--gallery-opacity",
              `${opacity}`,
            );
            pair.style.setProperty(
              "--gallery-scale",
              `${scale}`,
            );
            pair.style.setProperty(
              "--gallery-rotate",
              "0deg",
            );
            pair.style.setProperty(
              "--gallery-progress",
              "1",
            );
            pair.style.setProperty(
              "--gallery-x",
              "0px",
            );
          } else {
            pair.style.setProperty(
              "--gallery-distance",
              "-900px",
            );
            pair.style.setProperty(
              "--gallery-opacity",
              "0",
            );
            pair.style.setProperty(
              "--gallery-scale",
              "0.7",
            );
            pair.style.setProperty(
              "--gallery-rotate",
              "0deg",
            );
            pair.style.setProperty(
              "--gallery-progress",
              "0",
            );
            pair.style.setProperty(
              "--gallery-x",
              "0px",
            );
          }

          const visible = isActive || isPrevious;

          pair.classList.toggle("is-active", isActive);
          pair.setAttribute(
            "aria-hidden",
            visible ? "false" : "true",
          );
          pair.style.pointerEvents = isActive ? "auto" : "none";
          pair.style.visibility = visible ? "visible" : "hidden";
        });

        section.style.setProperty(
          "--gallery-active-index",
          `${activeIndex}`,
        );

        return;
      }

      /*
       * Desktop/tablet:
       * Keep the established depth-gallery language, but derive the pair
       * progress from the same global sequence coordinate. This guarantees
       * that the final pair reaches the same settled camera position as every
       * earlier pair instead of stopping prematurely.
       */
      const pairCount = Math.max(pairElements.length, 1);
      const galleryPosition = sequenceProgress * pairCount;
      const activeProgress = clamp(
        galleryPosition - activeIndex,
        0,
        1,
      );

      pairElements.forEach((pair, index) => {
        let distance = -900;
        let opacity = 0;
        let scale = 0.52;
        let rotate = 0;

        if (index === activeIndex) {
          distance = -520 + activeProgress * 520;
          opacity = clamp(activeProgress * 1.8, 0, 1);
          scale = 0.58 + activeProgress * 0.22;
          rotate = (1 - activeProgress) * 1.2;
        } else if (index === activeIndex - 1) {
          const exitProgress = clamp(
            (activeProgress - 0.22) / 0.28,
            0,
            1,
          );

          distance = exitProgress * 240;
          opacity = 1 - exitProgress;
          scale = 0.82 + exitProgress * 0.08;
          rotate = -exitProgress * 1.7;
        } else if (index === activeIndex + 1) {
          distance = -950;
          opacity = activeProgress > 0.72 ? 0.08 : 0;
          scale = 0.4;
          rotate = 0;
        }

        pair.style.setProperty(
          "--gallery-distance",
          `${distance}px`,
        );
        pair.style.setProperty(
          "--gallery-opacity",
          `${opacity}`,
        );
        pair.style.setProperty(
          "--gallery-scale",
          `${scale}`,
        );
        pair.style.setProperty(
          "--gallery-rotate",
          `${rotate}deg`,
        );
        pair.style.setProperty(
          "--gallery-progress",
          `${index === activeIndex ? activeProgress : 0}`,
        );
        pair.style.setProperty(
          "--gallery-x",
          "0px",
        );

        const visible =
          index === activeIndex ||
          (index === activeIndex - 1 && opacity > 0) ||
          (index === activeIndex + 1 && opacity > 0);

        const isActive = index === activeIndex;

        pair.classList.toggle("is-active", isActive);
        pair.setAttribute(
          "aria-hidden",
          visible ? "false" : "true",
        );
        pair.style.pointerEvents = isActive ? "auto" : "none";
        pair.style.visibility = visible ? "visible" : "hidden";
      });

      section.style.setProperty(
        "--gallery-active-index",
        `${activeIndex}`,
      );
    };

    const requestRender = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(renderGallery);
      }
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    reducedMotion.addEventListener("change", requestRender);
    mobileQuery.addEventListener("change", requestRender);

    requestRender();

    registerCleanup(() => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      reducedMotion.removeEventListener("change", requestRender);
      mobileQuery.removeEventListener("change", requestRender);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      document.removeEventListener(
        "pointerup",
        handleGalleryPointerUp,
        true,
      );

      document.removeEventListener(
        "click",
        handleGalleryDocumentClick,
        true,
      );
    });
  });

  return `
    <section id="now-showing" class="now-showing container">
      <h2 class="now-showing__title">
        Now Showing
      </h2>

      <div class="now-showing__sequence">
        <div class="now-showing__stage" aria-live="polite">
          <div class="now-showing__ceiling" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>

          <div class="now-showing__walls" aria-hidden="true">
            <div class="now-showing__wall now-showing__wall--left"></div>
            <div class="now-showing__wall now-showing__wall--right"></div>
          </div>

          <div class="now-showing__floor" aria-hidden="true">
            <div class="now-showing__floor-line now-showing__floor-line--1"></div>
            <div class="now-showing__floor-line now-showing__floor-line--2"></div>
            <div class="now-showing__floor-line now-showing__floor-line--3"></div>
          </div>

          <div class="now-showing__pairs">
            ${pairs
              .map(
                (pair, pairIndex) => `
                  <div
                    class="now-showing__pair${pair.length === 1 ? " now-showing__pair--single" : ""}"
                    data-pair="${pairIndex}"
                    aria-hidden="${pairIndex === 0 ? "false" : "true"}"
                  >
                    <div class="now-showing__frame now-showing__frame--left">
                      ${pair[0] ? MovieCard(pair[0]) : ""}
                    </div>
                    <div class="now-showing__frame now-showing__frame--right">
                      ${pair[1] ? MovieCard(pair[1]) : ""}
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>

          <div class="now-showing__vanishing-light" aria-hidden="true"></div>
          <div class="now-showing__walkway" aria-hidden="true"></div>
        </div>

        <div class="now-showing__steps" aria-hidden="true">
          ${pairs
            .map(
              (_, pairIndex) => `
                <div class="now-showing__step" data-pair-index="${pairIndex}"></div>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}