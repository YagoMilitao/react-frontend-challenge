import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib/logger";

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Erro de resposta HTTP da API do TMDB, com o status code preservado para que
 * chamadores possam diferenciar, por exemplo, 404 (recurso inexistente) de
 * falhas de rede/servidor (5xx), que são recuperáveis via retry.
 */
export class TMDBHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "TMDBHttpError";
  }
}

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
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorData = await response.json().catch((parseError: unknown) => {
        logger.error("[http-client] Corpo de erro do TMDB não é JSON válido:", parseError);
        return {};
      });
      throw new TMDBHttpError(
        response.status,
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
