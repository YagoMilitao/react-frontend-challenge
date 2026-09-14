import { keepPreviousData, useQuery } from "@tanstack/react-query";
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

export function useTrendingMovies(page = 1, enabled = true) {
  return useQuery({
    queryKey: ["movies", "trending", page],
    queryFn: () =>
      tmdbClient.get<PaginatedResponse<Movie>>("/trending/movie/day", {
        page,
        language: "pt-BR",
      }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePopularMovies(page = 1, filters?: MovieFilter, enabled = true) {
  return useQuery({
    queryKey: ["movies", "popular", page, filters],
    queryFn: () =>
      tmdbClient.get<PaginatedResponse<Movie>>("/discover/movie", {
        page,
        language: "pt-BR",
        sort_by: "popularity.desc",
        ...buildDiscoverParams(filters),
      }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

function matchesFilters(movie: Movie, filters?: MovieFilter) {
  if (filters?.selectedGenres && filters.selectedGenres.length > 0) {
    const hasGenre = filters.selectedGenres.some((genreId) => movie.genre_ids.includes(genreId));
    if (!hasGenre) return false;
  }
  if (filters?.minRating && movie.vote_average < filters.minRating) {
    return false;
  }
  return true;
}

export function useSearchMovies(query: string, filters?: MovieFilter, page = 1) {
  return useQuery({
    queryKey: ["movies", "search", query, page, filters],
    queryFn: () =>
      tmdbClient
        .get<PaginatedResponse<Movie>>("/search/movie", {
          query,
          page,
          language: "pt-BR",
          include_adult: false,
          ...(filters?.year ? { primary_release_year: filters.year } : {}),
        })
        .then((res) => ({
          ...res,
          results: res.results.filter((movie) => matchesFilters(movie, filters)),
        })),
    enabled: query.length > 2,
    placeholderData: keepPreviousData,
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
