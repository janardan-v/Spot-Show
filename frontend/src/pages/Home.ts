import { NowShowing } from "../components/home/NowShowing";

export async function Home() {
  const nowShowing = await NowShowing();

  return `
    <main class="home-page">
      ${nowShowing}
    </main>
  `;
}