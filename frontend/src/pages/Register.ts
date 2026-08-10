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

      const formData = new FormData(form);

      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const age = Number(formData.get("age"));
      const password = formData.get("password") as string;

      try {
        await register(name, email, age, password);

        navigate(ROUTES.LOGIN);
      } catch (error) {
        const errorContainer = document.querySelector<HTMLParagraphElement>(
          "[data-register-error]",
        );

        if (errorContainer) {
          errorContainer.textContent =
            error instanceof Error ? error.message : "Registration failed";
        }
      }
    });
  });

  return `
    <main class="container">

      <h1>Register</h1>

      <form class="register-form" data-form="register">

        <div>
          <label for="register-name">
            Name
          </label>

          <input
            id="register-name"
            name="name"
            type="text"
            required
          />
        </div>

        <div>
          <label for="register-email">
            Email
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            required
          />
        </div>

        <div>
          <label for="register-age">
            Age
          </label>

          <input
            id="register-age"
            name="age"
            type="number"
            required
          />
        </div>

        <div>
          <label for="register-password">
            Password
          </label>

          <input
            id="register-password"
            name="password"
            type="password"
            required
          />
        </div>

        <button type="submit">
          Register
        </button>

        <p
          class="register-form__error"
          data-register-error
        ></p>

      </form>

    </main>
  `;
}
