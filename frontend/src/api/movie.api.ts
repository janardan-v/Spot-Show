import { request } from "./client";
import type { Movie } from "../types/movie";

interface GetShowsResponse {
  showResult: Movie[];
}

export function getShows() {
  return request<GetShowsResponse>("/shows");
}