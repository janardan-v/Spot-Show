import { getProfile } from "../api/auth.api";
import { clearTokens } from "../store/auth.store";
import { navigate } from "../router";
import { ROUTES } from "../types/routes";

export async function Account() {
  try {
    const profile = await getProfile();

    setTimeout(() => {
      const logoutButton =
        document.querySelector<HTMLButtonElement>(
          '[data-action="account-logout"]',
        );

      if (!logoutButton) {
        return;
      }

      logoutButton.addEventListener("click", () => {
        clearTokens();
        navigate(ROUTES.HOME);
      });
    });

    return `
      <main class="account-page">

        <section class="account-card">

          <h1>My Account</h1>

          <div class="account-info">

            <div class="account-field">
              <span class="account-field__label">
                Name
              </span>

              <span class="account-field__value">
                ${profile.name}
              </span>
            </div>

            <div class="account-field">
              <span class="account-field__label">
                Email
              </span>

              <span class="account-field__value">
                ${profile.email}
              </span>
            </div>

          </div>

          <button
            type="button"
            data-action="account-logout"
          >
            Logout
          </button>

        </section>

      </main>
    `;
  } catch (error) {
    console.error("Failed to load profile:", error);

    return `
      <main class="account-page">

        <section class="account-card">

          <h1>My Account</h1>

          <p>
            Unable to load your account details.
          </p>

        </section>

      </main>
    `;
  }
}