import { getShows } from "../api/movie.api";

export async function fetchShows() {
  const response = await getShows();

  return response.showResult;
}