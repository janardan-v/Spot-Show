import { ROUTES } from "../types/routes";

export function Navbar() {
  return `
    <header class="navbar">

      <div class="navbar__brand">
        🎬 SpotShow
      </div>

      <nav class="navbar__links">

        <a href="${ROUTES.HOME}">
          Home
        </a>

        <a href="${ROUTES.LOGIN}">
          Login
        </a>

        <a href="${ROUTES.REGISTER}">
          Register
        </a>

      </nav>

    </header>
  `;
}