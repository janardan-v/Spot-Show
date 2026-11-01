import { register } from "../api/auth.api";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";

export function Register() {
  setTimeout(() => {
    const form = document.querySelector<HTMLFormElement>(
      '[data-form="register"]',
    );
    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const errorContainer = document.querySelector<HTMLParagraphElement>(
        "[data-register-error]",
      );

      if (errorContainer) {
        errorContainer.textContent = "";
      }
      submit?.setAttribute("disabled", "");

      const formData = new FormData(form);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const age = Number(formData.get("age"));
      const password = formData.get("password") as string;

      try {
        await register(name, email, age, password);
        navigate(ROUTES.LOGIN);
      } catch (error) {
        if (errorContainer) {
          errorContainer.textContent =
            error instanceof Error ? error.message : "Membership registration failed";
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

      <section class="auth-card card" aria-labelledby="register-title">
        <div class="auth-badge">NEW ARCHIVE MEMBERSHIP</div>
        <h1 id="register-title" class="auth-title">CREATE ACCOUNT</h1>
        <p class="auth-sub">
          Already registered?
          <a href="${ROUTES.LOGIN}" data-route="${ROUTES.LOGIN}">Member log in</a>
        </p>

        <form class="auth-form" data-form="register" novalidate>
          <div class="field">
            <label for="register-name">PATRON NAME</label>
            <input id="register-name" name="name" type="text" autocomplete="name" required placeholder="Ada Lovelace" />
          </div>

          <div class="field">
            <label for="register-email">EMAIL ADDRESS</label>
            <input id="register-email" name="email" type="email" autocomplete="email" required placeholder="you@archive.com" />
          </div>

          <div class="field">
            <label for="register-age">AGE</label>
            <input id="register-age" name="age" type="number" min="1" required placeholder="21" />
          </div>

          <div class="field">
            <label for="register-password">PASSWORD</label>
            <input id="register-password" name="password" type="password" autocomplete="new-password" required placeholder="••••••••" />
          </div>

          <button type="submit" class="booking-confirm">ACQUIRE MEMBERSHIP PASS →</button>
          <p class="auth-error" data-register-error role="alert"></p>
        </form>
      </section>
    </main>
  `;
}
