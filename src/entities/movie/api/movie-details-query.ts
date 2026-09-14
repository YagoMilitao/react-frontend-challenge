import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import { tmdbClient } from "@/shared/api/http-client";
import type { Credits, Videos } from "@/shared/api/tmdb-types";
import type { MovieDetails } from "../types";

/**
 * `queryOptions` compartilhada entre `useMovieDetails` e `prefetchMovieDetails`:
 * garante que o prefetch (disparado no hover do card) e o hook real da página de
 * detalhes usam exatamente a mesma queryKey, então o prefetch de fato popula o
 * cache que o clique subsequente vai ler — sem isso seriam duas entradas de cache
 * distintas por acidente.
 */
function movieDetailsQueryOptions(movieId: number) {
  return queryOptions({
    queryKey: ["movies", "details", movieId] as const,
    queryFn: () => tmdbClient.get<MovieDetails>(`/movie/${movieId}`, { language: "pt-BR" }),
  });
}

export function useMovieDetails(movieId: number | null) {
  return useQuery({
    ...movieDetailsQueryOptions(movieId ?? -1),
    enabled: Boolean(movieId),
  });
}

/**
 * Prefetch dos detalhes de um filme — usado no hover/focus do MovieCard para que
 * a navegação para /movie/:id pareça instantânea. Se o cache já estiver fresco
 * (dentro do staleTime), `prefetchQuery` é um no-op.
 */
export function prefetchMovieDetails(queryClient: QueryClient, movieId: number) {
  return queryClient.prefetchQuery(movieDetailsQueryOptions(movieId));
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
    // `include_video_language` faz a API incluir vídeos em pt-BR/en-US/sem idioma
    // na mesma resposta — sem isso, filmes sem trailer cadastrado em pt-BR
    // retornariam uma lista vazia mesmo havendo trailer em outro idioma.
    queryFn: () =>
      tmdbClient.get<Videos>(`/movie/${movieId}/videos`, {
        language: "pt-BR",
        include_video_language: "pt,en,null",
      }),
    enabled: Boolean(movieId),
  });
}
