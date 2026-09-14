export const config = { runtime: "edge" };

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Allowlist das rotas de leitura do TMDB efetivamente usadas pelo app.
 * Evita que o endpoint funcione como um relay autenticado aberto para
 * qualquer rota da API do TMDB.
 */
const ALLOWED_PATH_PATTERNS = [
  /^trending\/movie\/day$/,
  /^discover\/movie$/,
  /^search\/movie$/,
  /^genre\/movie\/list$/,
  /^movie\/\d+$/,
  /^movie\/\d+\/credits$/,
  /^movie\/\d+\/videos$/,
];

function isAllowedPath(path: string) {
  return ALLOWED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * Proxy server-side para a API do TMDB.
 * O client chama `/api/tmdb/...` sem token nenhum; o rewrite em vercel.json
 * reescreve isso para `/api/tmdb?path=...` (preservando os demais query params),
 * e esta function injeta o Bearer token — guardado só em variável de ambiente
 * do servidor, nunca com prefixo VITE_ — antes de repassar ao TMDB. Assim o
 * token nunca chega ao bundle enviado ao navegador.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ status_message: "Método não permitido." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  if (!isAllowedPath(path)) {
    return new Response(JSON.stringify({ status_message: "Rota do TMDB não permitida." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

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
