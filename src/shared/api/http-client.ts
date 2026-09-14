import { env } from "@/shared/config/env";

/**
 * Cliente HTTP minimalista para a API do TMDB, via proxy same-origin
 * (api/tmdb/[...path].ts). O Bearer token é injetado pelo proxy no servidor —
 * este cliente nunca o vê nem o envia.
 */
export class TMDBHttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `TMDB API Error (${response.status}): ${errorData.status_message || response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }
}

/**
 * Instância única do cliente HTTP.
 */
export const tmdbClient = new TMDBHttpClient(env.tmdbBaseUrl);
