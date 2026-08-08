import { fetchShows } from "../../services/movie.service";
import { MovieCard } from "./MovieCard";

export async function NowShowing() {
  const shows = await fetchShows();

  return `
    <section class="now-showing container">

      <h2 class="now-showing__title">
        Now Showing
      </h2>

      <div class="now-showing__grid">

        ${shows.map((show) => MovieCard(show)).join("")}

      </div>

    </section>
  `;
}
