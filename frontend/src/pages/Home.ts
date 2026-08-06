import { Navbar } from "../components/Navbar";
import { Hero } from "../components/home/Hero";

export function Home() {
  return `
    ${Navbar()}

    ${Hero()}
  `;
}