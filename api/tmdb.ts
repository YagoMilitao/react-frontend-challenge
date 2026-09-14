export const config = { runtime: "edge" };

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Proxy server-side para a API do TMDB.
 * O client chama `/api/tmdb/...` sem token nenhum; o rewrite em vercel.json
 * reescreve isso para `/api/tmdb?path=...` (preservando os demais query params),
 * e esta function injeta o Bearer token — guardado só em variável de ambiente
 * do servidor, nunca com prefixo VITE_ — antes de repassar ao TMDB. Assim o
 * token nunca chega ao bundle enviado ao navegador.
 */
export default async function handler(request: Request): Promise<Response> {
  const token = process.env.TMDB_API_READ_TOKEN;

  if (!token) {
    return new Response(
      JSON.stringify({ status_message: "TMDB_API_READ_TOKEN não configurado no servidor." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const requestUrl = new URL(request.url);
  const path = requestUrl.searchParams.get("path") ?? "";
  requestUrl.searchParams.delete("path");

  const tmdbUrl = new URL(`${TMDB_BASE_URL}/${path}`);
  tmdbUrl.search = requestUrl.searchParams.toString();

  const tmdbResponse = await fetch(tmdbUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return new Response(tmdbResponse.body, {
    status: tmdbResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
