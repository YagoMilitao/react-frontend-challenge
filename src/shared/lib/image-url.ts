import { env } from "@/shared/config/env";

/**
 * Constrói URL completa para imagens do TMDB.
 * Suporta tamanhos: "w92", "w154", "w185", "w342", "w500", "w780", "original"
 *
 * @param path Poster/backdrop path retornado pela API (ex: "/kXfqcdQKsToO0OUXHcrrKcHMX4.jpg")
 * @param size Tamanho desejado (padrão: "w500")
 * @returns URL completa da imagem
 */
export function getImageUrl(path: string | null, size = "w500"): string {
  if (!path) return "/placeholder-movie.svg"; // Fallback se não houver imagem

  return `${env.tmdbImageBaseUrl}/${size}${path}`;
}

/**
 * URL de trailer no YouTube a partir da chave do vídeo.
 */
export function getYouTubeUrl(videoKey: string): string {
  return `https://www.youtube.com/watch?v=${videoKey}`;
}
