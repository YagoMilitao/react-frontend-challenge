import { env } from "@/shared/config/env";

/**
 * Cliente HTTP minimalista para a API do TMDB.
 * Encapsula o Bearer token e trata erros comuns (401, 404, 500).
 */
export class TMDBHttpClient {
  private baseUrl: string;
  private readToken: string;

  constructor(baseUrl: string, readToken: string) {
    this.baseUrl = baseUrl;
    this.readToken = readToken;
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.readToken}`,
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
export const tmdbClient = new TMDBHttpClient(env.tmdbBaseUrl, env.tmdbReadToken);
