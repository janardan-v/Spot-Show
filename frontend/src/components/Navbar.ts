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
  <header class="navbar">
    <div class="navbar__inner">
      <a
        class="navbar__brand"
        href="${ROUTES.HOME}"
        data-route="${ROUTES.HOME}"
        aria-label="SpotShow home"
      >
        <span class="navbar__brand-mark" aria-hidden="true"></span>
        <span>SpotShow</span>
      </a>

      <nav class="navbar__links" aria-label="Primary">
        <a
          href="${ROUTES.HOME}"
          data-route="${ROUTES.HOME}"${isActive(ROUTES.HOME)}
        >
          Shows
        </a>

        ${
          authenticated
            ? `
              <a
                href="${ROUTES.ACCOUNT}"
                data-route="${ROUTES.ACCOUNT}"${isActive(ROUTES.ACCOUNT)}
              >
                Account
              </a>
              <button
                type="button"
                class="navbar__ghost"
                data-action="logout"
              >
                Log out
              </button>
            `
            : `
              <a
                href="${ROUTES.LOGIN}"
                data-route="${ROUTES.LOGIN}"${isActive(ROUTES.LOGIN)}
              >
                Log in
              </a>
              <a
                class="navbar__primary"
                href="${ROUTES.REGISTER}"
                data-route="${ROUTES.REGISTER}"
              >
                Get started
              </a>
            `
        }
      </nav>
    </div>
  </header>
`;
}
