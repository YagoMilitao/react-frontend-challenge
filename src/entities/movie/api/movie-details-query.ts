import { useQuery } from "@tanstack/react-query";
import { tmdbClient } from "@/shared/api/http-client";
import type { Credits, Videos } from "@/shared/api/tmdb-types";
import type { MovieDetails } from "../types";

export function useMovieDetails(movieId: number | null) {
  return useQuery({
    queryKey: ["movies", "details", movieId],
    queryFn: () => tmdbClient.get<MovieDetails>(`/movie/${movieId}`, { language: "pt-BR" }),
    enabled: Boolean(movieId),
  });
}

export function useMovieCredits(movieId: number | null) {
  return useQuery({
    queryKey: ["movies", "credits", movieId],
    queryFn: () => tmdbClient.get<Credits>(`/movie/${movieId}/credits`, { language: "pt-BR" }),
    enabled: Boolean(movieId),
  });
}

export function useMovieVideos(movieId: number | null) {
  return useQuery({
    queryKey: ["movies", "videos", movieId],
    queryFn: () => tmdbClient.get<Videos>(`/movie/${movieId}/videos`, { language: "pt-BR" }),
    enabled: Boolean(movieId),
  });
}
