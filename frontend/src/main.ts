import "./styles/main.css";

import { renderCurrentRoute } from "./router";

async function initializeSpotShow() {
  await renderCurrentRoute();
}

initializeSpotShow();
