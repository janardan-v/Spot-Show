import { ROUTES } from "./types/routes";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Booking } from "./pages/Booking";
import { Show } from "./pages/Show";

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

  const pathname = window.location.pathname;

  if (pathname.startsWith(`${ROUTES.SHOW}/`)) {
    app.innerHTML = await Show();
    return;
  }

  switch (pathname) {
    case ROUTES.HOME:
      app.innerHTML = await Home();
      break;

    case ROUTES.LOGIN:
      app.innerHTML = Login();
      break;

    case ROUTES.REGISTER:
      app.innerHTML = Register();
      break;

    case ROUTES.BOOKING:
      app.innerHTML = Booking();
      break;

    default:
      app.innerHTML = `
        <main>
          <h1>404</h1>
          <p>Page Not Found</p>
        </main>
      `;
  }
}