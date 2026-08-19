import { ROUTES } from "./types/routes";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Booking } from "./pages/Booking";
import { Show } from "./pages/Show";
import { Account } from "./pages/Account";

import { runCleanup } from "./utils/lifecycle";

export function navigate(path: string) {
  window.history.pushState({}, "", path);

  renderCurrentRoute();
}

window.addEventListener("popstate", () => {
  renderCurrentRoute();
});

export async function renderCurrentRoute() {
  const app = document.querySelector("#app");

  if (!app) {
    throw new Error("Root element '#app' not found.");
  }

  runCleanup();

  let pageContent = document.querySelector("#page-content");

  // Create the app shell only once
  if (!pageContent) {
    app.innerHTML = `
      <div id="navbar-root"></div>
      <div id="page-content"></div>
    `;

    pageContent = document.querySelector("#page-content");

    if (!pageContent) {
      throw new Error("Page content container not found.");
    }
  }

  // The navbar depends on auth state, which can change between navigations
  // (login, logout) without a full page reload. Unlike the page-content
  // shell above, it must be re-rendered on every route change, not just
  // the first, so "Login/Register" vs "My Account/Logout" always reflects
  // the current auth state.
  const navbarRoot = document.querySelector<HTMLElement>("#navbar-root");

  if (navbarRoot) {
    navbarRoot.innerHTML = Navbar();
  }

  const pathname = window.location.pathname;

  if (pathname.startsWith(`${ROUTES.SHOW}/`)) {
    pageContent.innerHTML = await Show();
    return;
  }

  switch (pathname) {
    case ROUTES.HOME:
      pageContent.innerHTML = await Home();
      break;

    case ROUTES.LOGIN:
      pageContent.innerHTML = Login();
      break;

    case ROUTES.REGISTER:
      pageContent.innerHTML = Register();
      break;

    case ROUTES.BOOKING:
      pageContent.innerHTML = await Booking();
      break;

    case ROUTES.ACCOUNT:
      pageContent.innerHTML = await Account();
      break;

    default:
      pageContent.innerHTML = `
        <main>
          <h1>404</h1>
          <p>Page Not Found</p>
        </main>
      `;
  }
}

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  const routeElement = target.closest<HTMLElement>("[data-route]");

  if (!routeElement) {
    return;
  }

  const route = routeElement.dataset.route;

  if (!route) {
    return;
  }

  event.preventDefault();

  navigate(route);
});

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  const actionElement = target.closest<HTMLElement>("[data-action]");

  if (actionElement?.dataset.action === "explore-movies") {
    document.querySelector("#now-showing")?.scrollIntoView({
      behavior: "smooth",
    });

    return;
  }

  const routeElement = target.closest<HTMLElement>("[data-route]");

  if (!routeElement) {
    return;
  }

  const route = routeElement.dataset.route;

  if (!route) {
    return;
  }

  event.preventDefault();

  navigate(route);
});