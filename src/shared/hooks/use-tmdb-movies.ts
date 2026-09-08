import { useQuery } from "@tanstack/react-query";
import { tmdbClient } from "@/shared/api/http-client";
import type {
  Movie,
  MovieDetails,
  PaginatedResponse,
  Credits,
  Videos,
  Genre,
} from "@/shared/api/tmdb-types";

/**
 * Fetch filmes em tendência.
 * Utiliza cache agressivo (staleTime 5 min) porque o catálogo não muda frequentemente.
 */
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

/**
 * Fetch filmes populares com filtros opcionais.
 */
export function usePopularMovies(
  page = 1,
  options?: { genreIds?: string; year?: number; minRating?: number },
) {
  return useQuery({
    queryKey: ["movies", "popular", page, options],
    queryFn: () =>
      tmdbClient.get<PaginatedResponse<Movie>>("/discover/movie", {
        page,
        language: "pt-BR",
        sort_by: "popularity.desc",
        ...(options?.genreIds && { with_genres: options.genreIds }),
        ...(options?.year && { primary_release_year: options.year }),
        ...(options?.minRating && { "vote_average.gte": options.minRating }),
      }),
  });
}

/**
 * Busca filmes por query (nome, ator, etc).
 * Sem cache agressivo porque resultados podem variar muito.
 */
export function useSearchMovies(query: string, page = 1) {
  return useQuery({
    queryKey: ["movies", "search", query, page],
    queryFn: () =>
      tmdbClient.get<PaginatedResponse<Movie>>("/search/movie", {
        query,
        page,
        language: "pt-BR",
        include_adult: false,
      }),
    enabled: query.length > 2, // Só faz fetch se query tiver 3+ caracteres
  });
}

/**
 * Detalhes completos de um filme.
 */
export function useMovieDetails(movieId: number | null) {
  return useQuery({
    queryKey: ["movies", "details", movieId],
    queryFn: () => tmdbClient.get<MovieDetails>(`/movie/${movieId}`, { language: "pt-BR" }),
    enabled: Boolean(movieId),
  });
}

/**
 * Elenco e crew de um filme.
 */
export function useMovieCredits(movieId: number | null) {
  return useQuery({
    queryKey: ["movies", "credits", movieId],
    queryFn: () => tmdbClient.get<Credits>(`/movie/${movieId}/credits`, { language: "pt-BR" }),
    enabled: Boolean(movieId),
  });
}

/**
 * Vídeos (trailers, teasers) de um filme.
 */
export function useMovieVideos(movieId: number | null) {
  return useQuery({
    queryKey: ["movies", "videos", movieId],
    queryFn: () => tmdbClient.get<Videos>(`/movie/${movieId}/videos`, { language: "pt-BR" }),
    enabled: Boolean(movieId),
  });
}

/**
 * Lista de gêneros (cachado indefinidamente porque nunca muda).
 */
export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () =>
      tmdbClient
        .get<{ genres: Genre[] }>("/genre/movie/list", { language: "pt-BR" })
        .then((res) => res.genres),
    staleTime: Infinity, // Gêneros nunca mudam; cache permanente
  });
}
