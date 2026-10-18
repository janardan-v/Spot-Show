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
      <main class="container narrow auth-page">
        <section class="auth-card card" aria-labelledby="account-title">
          <p class="eyebrow">Member area</p>
          <h1 id="account-title">My account</h1>
          <p class="section-sub">Signed in to SpotShow.</p>

          <dl class="account-rows">
            <div>
              <dt>Name</dt>
              <dd>${profile.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>${profile.email}</dd>
            </div>
          </dl>

          <button type="button" class="btn-ghost" data-action="account-logout">
            Log out
          </button>
        </section>
      </main>
    `;
  } catch (error) {
    console.error("Failed to load profile:", error);

    return `
      <main class="container narrow auth-page">
        <section class="auth-card card" aria-labelledby="account-title">
          <p class="eyebrow">Member area</p>
          <h1 id="account-title">My account</h1>
          <div class="empty-state" role="alert">
            Unable to load your account details. Please log in again.
            <a href="${ROUTES.LOGIN}" data-route="${ROUTES.LOGIN}">Go to login</a>
          </div>
        </section>
      </main>
    `;
  }
}
