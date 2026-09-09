export type { Movie, MovieDetails, Genre, Credits, Videos } from "@/shared/api/tmdb-types";

import type { Genre } from "@/shared/api/tmdb-types";

export interface MovieFilter {
  selectedGenres?: number[];
  year?: number;
  minRating?: number;
}

export type MovieGenre = Genre;
