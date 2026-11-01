import { Preloader, initPreloader } from "../components/home/Preloader";
import { Hero, initHeroAutonomousEngine } from "../components/home/Hero";

export async function Home() {
  const preloader = Preloader();
  const hero = await Hero();

  setTimeout(() => {
    initPreloader();
    initHeroAutonomousEngine();
  }, 30);

  return `
    ${preloader}
    <main class="home-page">
      ${hero}
    </main>
  `;
}
