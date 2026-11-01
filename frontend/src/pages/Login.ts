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
            error instanceof Error ? error.message : "Authentication failed";
        }
        submit?.removeAttribute("disabled");
      }
    });
  });

  return `
    <main class="container narrow auth-page">
      <div class="show-breadcrumb">
        <a class="back-link" href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">
          ← RETURN TO PROGRAMME
        </a>
      </div>

      <section class="auth-card card" aria-labelledby="login-title">
        <div class="auth-badge">MEMBER PORTAL</div>
        <h1 id="login-title" class="auth-title">AUTHENTICATE PASS</h1>
        <p class="auth-sub">
          ${returnTo ? "Authenticate to finalize your locked auditorium seats." : "Sign in to access your SpotShow credentials & reservations."}
          No pass?
          <a href="${ROUTES.REGISTER}" data-route="${ROUTES.REGISTER}">Acquire membership</a>
        </p>

        <form class="auth-form" data-form="login" novalidate>
          <div class="field">
            <label for="login-email">MEMBER EMAIL</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="cinephile@archive.com"
            />
          </div>

          <div class="field">
            <label for="login-password">PASSWORD</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="booking-confirm">SIGN IN TO SPOTSHOW →</button>
          <p class="auth-error" data-login-error role="alert"></p>
        </form>
      </section>
    </main>
  `;
}
