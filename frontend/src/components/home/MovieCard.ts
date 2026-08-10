import type { Movie } from "../../types/movie";
import { ROUTES } from "../../types/routes";
import { moviePosters } from "../../utils/moviePosters";

export function MovieCard(movie: Movie) {
  const poster =
    moviePosters[movie.movieName] ??
    moviePosters.default;

  return `
    <article class="movie-card">

      <img
        class="movie-card__poster"
        src="${poster}"
        alt="${movie.movieName}"
      />

      <div class="movie-card__content">

        <h3 class="movie-card__title">
          ${movie.movieName}
        </h3>

        <p class="movie-card__date">
          ${new Date(movie.showDate).toLocaleString()}
        </p>

        <button class="movie-card__button"  data-route="${ROUTES.SHOW}/${movie.id}"">
          Book Tickets
        </button>

      </div>

    </article>
  `;
}