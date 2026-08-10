import { login } from "../api/auth.api";
import { setTokens } from "../store/auth.store";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";

export function Login() {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get("returnTo");
  setTimeout(() => {
    const form = document.querySelector<HTMLFormElement>('[data-form="login"]');

    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      try {
        const result = await login(email, password);

        setTokens(result.accessToken, result.refreshToken);


        navigate(returnTo ?? ROUTES.HOME);
        8;
      } catch (error) {
        const errorContainer =
          document.querySelector<HTMLParagraphElement>("[data-login-error]");

        if (errorContainer) {
          errorContainer.textContent =
            error instanceof Error ? error.message : "Login failed";
        }
      }
    });
  });

  return `
    <main class="container">

      <h1>Login</h1>

      ${
        returnTo
          ? `
            <p class="login-message">
              Please log in to continue with your booking.
            </p>
          `
          : ""
      }

      <form class="login-form" data-form="login">

        <div>
          <label for="login-email">
            Email
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            required
          />
        </div>

        <div>
          <label for="login-password">
            Password
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            required
          />
        </div>

        <button type="submit">
          Login
        </button>

        <p
          class="login-form__error"
          data-login-error
        ></p>

      </form>

    </main>
  `;
}
