import { Navbar } from "../components/Navbar";
import { Hero } from "../components/home/Hero";
import { NowShowing } from "../components/home/NowShowing";

export async function Home() {

  const nowShowing = await NowShowing();

  return `
    ${Navbar()}

    ${Hero()}

    ${nowShowing}
  `;
}