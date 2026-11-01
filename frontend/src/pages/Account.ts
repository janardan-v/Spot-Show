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
        <div class="show-breadcrumb">
          <a class="back-link" href="${ROUTES.HOME}" data-route="${ROUTES.HOME}">
            ← RETURN TO PROGRAMME
          </a>
        </div>

        <section class="auth-card card" aria-labelledby="account-title">
          <div class="auth-badge">ACTIVE CREDENTIAL</div>
          <h1 id="account-title" class="auth-title">PATRON ACCOUNT</h1>
          <p class="auth-sub">Verified member access for SpotShow screening reservations.</p>

          <dl class="account-rows">
            <div>
              <dt>PATRON NAME</dt>
              <dd>${profile.name}</dd>
            </div>
            <div>
              <dt>REGISTERED EMAIL</dt>
              <dd>${profile.email}</dd>
            </div>
            <div>
              <dt>TIER</dt>
              <dd>CINEMA ARCHIVE MEMBER</dd>
            </div>
          </dl>

          <button type="button" class="btn-ghost" data-action="account-logout">
            TERMINATE SESSION (SIGN OUT)
          </button>
        </section>
      </main>
    `;
  } catch (error) {
    console.error("Failed to load profile:", error);

    return `
      <main class="container narrow auth-page">
        <section class="auth-card card" aria-labelledby="account-title">
          <div class="auth-badge">ACCESS EXPIRED</div>
          <h1 id="account-title" class="auth-title">PATRON ACCOUNT</h1>
          <div class="empty-state" role="alert">
            Your session has ended or could not be verified. Please authenticate again.
            <a href="${ROUTES.LOGIN}" data-route="${ROUTES.LOGIN}">Sign in to member portal</a>
          </div>
        </section>
      </main>
    `;
  }
}
