import { ROUTES } from "./types/routes";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Booking } from "./pages/Booking";

export function renderCurrentRoute() {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("Root element '#app' not found.");
  }

  switch (window.location.pathname) {
    case ROUTES.HOME:
      app.innerHTML = Home();
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