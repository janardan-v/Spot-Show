import { ROUTES } from "../types/routes";
import { isAuthenticated, clearTokens } from "../store/auth.store";
import { logout } from "../api/auth.api";
import { navigate } from "../router";

export function Navbar() {
  const authenticated = isAuthenticated();
  const pathname = window.location.pathname;

  setTimeout(() => {
    const logoutButton = document.querySelector<HTMLButtonElement>(
      '[data-action="logout"]',
    );

    if (!logoutButton) {
      return;
    }

    logoutButton.addEventListener("click", async () => {
      try {
        await logout();
      } catch (error) {
        console.error("Logout request failed:", error);
      } finally {
        clearTokens();
        navigate(ROUTES.HOME);
      }
    });
  });

  const isActive = (route: string) =>
    pathname === route ? ' aria-current="page"' : "";

  return `
  <header class="navbar" role="banner">
    <div class="navbar__inner">
      <div class="navbar__brand-wrap">
        <a
          class="navbar__brand"
          href="${ROUTES.HOME}"
          data-route="${ROUTES.HOME}"
          aria-label="SpotShow Home"
        >
          <span class="navbar__brand-icon" aria-hidden="true">
            <svg class="spotshow-emblem" viewBox="0 0 28 28" width="22" height="22" fill="none">
              <circle cx="14" cy="14" r="12" stroke="currentColor" stroke-width="1.6" />
              <circle cx="14" cy="14" r="8.5" stroke="currentColor" stroke-width="0.8" stroke-dasharray="1.5 1.5" opacity="0.5" />
              <circle cx="14" cy="7.2" r="1.3" fill="var(--color-accent, #c9a24a)" />
              <circle cx="8.1" cy="17.4" r="1.3" fill="var(--color-accent, #c9a24a)" />
              <circle cx="19.9" cy="17.4" r="1.3" fill="var(--color-accent, #c9a24a)" />
              <circle cx="14" cy="14" r="3.2" fill="currentColor" />
              <circle cx="14" cy="14" r="1.2" fill="var(--navbar-bg, #050505)" />
            </svg>
          </span>
          <span class="navbar__brand-title">SPOTSHOW</span>
          <span class="navbar__brand-badge" aria-hidden="true">CINEMA ARCHIVE</span>
        </a>
        <span class="navbar__meta-divider" aria-hidden="true">/</span>
        <span class="navbar__meta-season">SEASON 2030</span>
      </div>

      <nav class="navbar__links" aria-label="Primary Navigation">
        <a
          class="navbar__link"
          href="${ROUTES.HOME}"
          data-route="${ROUTES.HOME}"${isActive(ROUTES.HOME)}
        >
          Programme
        </a>

        ${
          authenticated
            ? `
              <a
                class="navbar__link"
                href="${ROUTES.ACCOUNT}"
                data-route="${ROUTES.ACCOUNT}"${isActive(ROUTES.ACCOUNT)}
              >
                Passes & Account
              </a>
              <button
                type="button"
                class="navbar__ghost"
                data-action="logout"
              >
                Sign Out
              </button>
            `
            : `
              <a
                class="navbar__link"
                href="${ROUTES.LOGIN}"
                data-route="${ROUTES.LOGIN}"${isActive(ROUTES.LOGIN)}
              >
                Member Log In
              </a>
              <a
                class="navbar__primary"
                href="${ROUTES.REGISTER}"
                data-route="${ROUTES.REGISTER}"
              >
                Acquire Pass
              </a>
            `
        }
      </nav>
    </div>
  </header>
`;
}
