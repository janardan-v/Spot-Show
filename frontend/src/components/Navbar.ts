import { ROUTES } from "../types/routes";
import { isAuthenticated, clearTokens } from "../store/auth.store";
import { logout } from "../api/auth.api";
import { navigate } from "../router";
export function Navbar() {
  const authenticated = isAuthenticated();
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
  return `
  <header class="navbar">

    <div class="navbar__brand">
      SpotShow
    </div>

    <nav class="navbar__links">

      <a
        href="${ROUTES.HOME}"
        data-route="${ROUTES.HOME}"
      >
        Home
      </a>

      ${
        authenticated
          ? `

            <a
              href="${ROUTES.ACCOUNT}"
              data-route="${ROUTES.ACCOUNT}"
            >
              My Account
            </a>
            <button
              type="button"
              data-action="logout"
            >
              Logout
            </button>
          `
          : `
            <a
              href="${ROUTES.LOGIN}"
              data-route="${ROUTES.LOGIN}"
            >
              Login
            </a>

            <a
              href="${ROUTES.REGISTER}"
              data-route="${ROUTES.REGISTER}"
            >
              Register
            </a>
          `
      }

    </nav>

  </header>
`;
}
