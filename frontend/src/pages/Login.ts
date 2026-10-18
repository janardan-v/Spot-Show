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

      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const errorContainer =
        document.querySelector<HTMLParagraphElement>("[data-login-error]");

      if (errorContainer) {
        errorContainer.textContent = "";
      }
      submit?.setAttribute("disabled", "");

      const formData = new FormData(form);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      try {
        const result = await login(email, password);
        setTokens(result.accessToken, result.refreshToken);
        navigate(returnTo ?? ROUTES.HOME);
      } catch (error) {
        if (errorContainer) {
          errorContainer.textContent =
            error instanceof Error ? error.message : "Login failed";
        }
        submit?.removeAttribute("disabled");
      }
    });
  });

  return `
    <main class="container narrow auth-page">
      <section class="auth-card card" aria-labelledby="login-title">
        <p class="eyebrow">Member access</p>
        <h1 id="login-title">Log in</h1>
        <p class="section-sub">
          ${returnTo ? "Please log in to continue with your booking." : "Welcome back to SpotShow."}
          No account?
          <a href="${ROUTES.REGISTER}" data-route="${ROUTES.REGISTER}">Create one</a>
        </p>

        <form class="auth-form" data-form="login" novalidate>
          <div class="field">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div class="field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="booking-confirm">Log in</button>
          <p class="auth-error" data-login-error role="alert"></p>
        </form>
      </section>
    </main>
  `;
}
