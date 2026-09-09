import { useQuery } from "@tanstack/react-query";
import { tmdbClient } from "@/shared/api/http-client";
import type { PaginatedResponse } from "@/shared/api/tmdb-types";
import type { Movie, MovieFilter, MovieGenre } from "../types";

function buildDiscoverParams(filters?: MovieFilter) {
  const params: Record<string, string | number> = {};

  if (filters?.selectedGenres && filters.selectedGenres.length > 0) {
    params.with_genres = filters.selectedGenres.join(",");
  }
  if (filters?.year) {
    params.primary_release_year = filters.year;
  }
  if (filters?.minRating) {
    params["vote_average.gte"] = filters.minRating;
  }

  return params;
}

export function useTrendingMovies(page = 1) {
  return useQuery({
    queryKey: ["movies", "trending", page],
    queryFn: () =>
      tmdbClient.get<PaginatedResponse<Movie>>("/trending/movie/day", {
        page,
        language: "pt-BR",
      }),
  });
}

export function usePopularMovies(page = 1, filters?: MovieFilter) {
  return useQuery({
    queryKey: ["movies", "popular", page, filters],
    queryFn: () =>
      tmdbClient.get<PaginatedResponse<Movie>>("/discover/movie", {
        page,
        language: "pt-BR",
        sort_by: "popularity.desc",
        ...buildDiscoverParams(filters),
      }),
  });
}

export function useSearchMovies(query: string, filters?: MovieFilter, page = 1) {
  return useQuery({
    queryKey: ["movies", "search", query, page, filters],
    queryFn: () =>
      tmdbClient.get<PaginatedResponse<Movie>>("/search/movie", {
        query,
        page,
        language: "pt-BR",
        include_adult: false,
        ...buildDiscoverParams(filters),
      }),
    enabled: query.length > 2,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () =>
      tmdbClient
        .get<{ genres: MovieGenre[] }>("/genre/movie/list", { language: "pt-BR" })
        .then((res) => res.genres),
    staleTime: Infinity,
  });
}
