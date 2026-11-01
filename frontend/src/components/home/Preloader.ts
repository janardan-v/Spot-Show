import { registerCleanup } from "../../utils/lifecycle";

/*
 * Preloader — SpotShow Cinema Archive ("Preloader -> Hero")
 *
 * Features an authentic physical grooved disc loader, high-contrast architectural
 * typography, real-time projection calibration telemetry, and a cinematic
 * shutter wipe that reveals the Hero programme.
 */

const STORAGE_KEY = "spotshow_preloader_seen";

const CALIBRATION_STAGES = [
  { threshold: 0, label: "[01/04] INITIALIZING SOUNDTRACK OPTICAL STEREO" },
  { threshold: 24, label: "[02/04] CALIBRATING 70MM PROJECTION EXPANSION" },
  { threshold: 52, label: "[03/04] ALIGNING DUAL LASER APERTURE" },
  { threshold: 78, label: "[04/04] RETRIEVING ARCHIVAL CRATE REELS" },
  { threshold: 96, label: "[ARCHIVE SYNCHRONIZED // UNLOCKING PROGRAMME]" },
];

export function Preloader(): string {
  return `
    <aside
      id="spotshow-preloader"
      class="preloader"
      role="progressbar"
      aria-label="SpotShow Cinema Archive Initializing"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="0"
    >
      <!-- 1. Top Archival Telemetry Chrome -->
      <div class="preloader__chrome preloader__chrome--top">
        <div class="preloader__chrome-item">
          <span class="preloader__pulse-dot" aria-hidden="true"></span>
          <span class="preloader__chrome-title">SPOTSHOW [CINEMA ARCHIVE]</span>
        </div>
        <div class="preloader__chrome-item preloader__chrome-item--center">
          <span>PROJECTION CALIBRATION // 2030</span>
        </div>
        <div class="preloader__chrome-item preloader__chrome-item--right">
          <span>70MM · 35MM · DUAL LASER</span>
        </div>
      </div>

      <!-- 2. Central Stage: Grooved Physical Disc + Large Counter + Status -->
      <div class="preloader__stage">
        <div class="preloader__disc-wrap" aria-hidden="true">
          <div class="preloader__disc">
            <div class="preloader__disc-grooves"></div>
            <div class="preloader__disc-sheen"></div>
            <div class="preloader__disc-center">
              <div class="preloader__disc-spindle"></div>
              <span class="preloader__disc-rpm">33⅓ RPM</span>
              <span class="preloader__disc-brand">SPOTSHOW</span>
              <span class="preloader__disc-code">SS-2030</span>
            </div>
          </div>
        </div>

        <div class="preloader__counter-block">
          <div class="preloader__counter-row">
            <span class="preloader__counter-num" id="preloader-counter">00</span>
            <span class="preloader__counter-unit">%</span>
          </div>
          <div class="preloader__status" id="preloader-status" aria-live="polite">
            [01/04] INITIALIZING SOUNDTRACK OPTICAL STEREO
          </div>
        </div>

        <!-- Hairline Progress Bar -->
        <div class="preloader__track-wrap" aria-hidden="true">
          <div class="preloader__track">
            <div class="preloader__bar" id="preloader-bar"></div>
          </div>
        </div>
      </div>

      <!-- 3. Bottom Archival Telemetry Chrome -->
      <div class="preloader__chrome preloader__chrome--bottom">
        <div class="preloader__chrome-item">
          <span>CURATORIAL SEASON 2030</span>
        </div>
        <div class="preloader__chrome-item preloader__chrome-item--center">
          <span>ANALOG MASTERS // 24 FPS</span>
        </div>
        <div class="preloader__chrome-item preloader__chrome-item--right">
          <button
            type="button"
            class="preloader__skip-btn"
            id="preloader-skip"
            aria-label="Skip Archive Preloader"
          >
            SKIP INTRO [ESC] →
          </button>
        </div>
      </div>
    </aside>
  `;
}

export function initPreloader(forceReplay = false): void {
  const preloader = document.getElementById("spotshow-preloader");
  const counterEl = document.getElementById("preloader-counter");
  const statusEl = document.getElementById("preloader-status");
  const barEl = document.getElementById("preloader-bar");
  const skipBtn = document.getElementById("preloader-skip");
  const heroEl = document.querySelector(".hero");

  if (!preloader) {
    heroEl?.classList.add("hero--revealed");
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alreadySeen = sessionStorage.getItem(STORAGE_KEY) === "true";
  const urlParams = new URLSearchParams(window.location.search);
  const skipParam = urlParams.get("skip") === "true" || urlParams.get("nopreloader") === "true";

  if ((alreadySeen && !forceReplay) || reducedMotion || skipParam) {
    preloader.style.display = "none";
    heroEl?.classList.add("hero--revealed");
    sessionStorage.setItem(STORAGE_KEY, "true");
    return;
  }

  preloader.style.display = "flex";
  preloader.classList.remove("preloader--exiting");
  heroEl?.classList.remove("hero--revealed");

  let rafId = 0;
  let exitTimeoutId = 0;
  let finishTimeoutId = 0;
  let isExiting = false;

  const getStageLabel = (pct: number) => {
    let matched = CALIBRATION_STAGES[0].label;
    for (const stage of CALIBRATION_STAGES) {
      if (pct >= stage.threshold) {
        matched = stage.label;
      }
    }
    return matched;
  };

  const triggerExit = () => {
    if (isExiting) return;
    isExiting = true;

    if (rafId) window.cancelAnimationFrame(rafId);

    if (counterEl) counterEl.textContent = "100";
    if (statusEl) statusEl.textContent = "[ARCHIVE SYNCHRONIZED // UNLOCKING PROGRAMME]";
    if (barEl) barEl.style.transform = "scaleX(1)";
    preloader.setAttribute("aria-valuenow", "100");

    exitTimeoutId = window.setTimeout(() => {
      preloader.classList.add("preloader--exiting");
      heroEl?.classList.add("hero--revealed");
      sessionStorage.setItem(STORAGE_KEY, "true");

      finishTimeoutId = window.setTimeout(() => {
        preloader.style.display = "none";
      }, 900);
    }, 140);
  };

  const duration = 1800;
  const startTime = performance.now();

  const updateProgress = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const rawProgress = Math.min(1, elapsed / duration);

    const ease =
      rawProgress < 0.5
        ? 2 * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

    const currentPct = Math.min(100, Math.floor(ease * 100));

    if (counterEl) {
      counterEl.textContent = currentPct < 10 ? `0${currentPct}` : `${currentPct}`;
    }
    if (statusEl) {
      statusEl.textContent = getStageLabel(currentPct);
    }
    if (barEl) {
      barEl.style.transform = `scaleX(${(currentPct / 100).toFixed(3)})`;
    }
    preloader.setAttribute("aria-valuenow", String(currentPct));

    if (rawProgress < 1) {
      rafId = window.requestAnimationFrame(updateProgress);
    } else {
      triggerExit();
    }
  };

  rafId = window.requestAnimationFrame(updateProgress);

  const handleSkip = () => {
    triggerExit();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      triggerExit();
    }
  };

  skipBtn?.addEventListener("click", handleSkip);
  window.addEventListener("keydown", handleKeyDown);

  registerCleanup(() => {
    if (rafId) window.cancelAnimationFrame(rafId);
    if (exitTimeoutId) window.clearTimeout(exitTimeoutId);
    if (finishTimeoutId) window.clearTimeout(finishTimeoutId);
    skipBtn?.removeEventListener("click", handleSkip);
    window.removeEventListener("keydown", handleKeyDown);
  });
}
