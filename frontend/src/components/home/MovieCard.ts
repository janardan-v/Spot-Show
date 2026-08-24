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

      <div
        class="movie-card__reflection"
        aria-hidden="true"
      >
        <img
          src="${poster}"
          alt=""
          draggable="false"
        />
      </div>

      <div class="movie-card__content">

        <h3 class="movie-card__title">
          ${movie.movieName}
        </h3>

        <p class="movie-card__date">
          ${new Date(movie.showDate).toLocaleString()}
        </p>

        <a
          class="movie-card__button"
          href="${ROUTES.SHOW}/${movie.id}"
          data-route="${ROUTES.SHOW}/${movie.id}"
          aria-label="Book tickets for ${movie.movieName}"
        >
          Book Tickets
        </a>

      </div>

    </article>
  `;
}