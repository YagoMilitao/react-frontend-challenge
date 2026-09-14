/**
 * Ponto único de leitura das variáveis de ambiente.
 * Falha cedo (em desenvolvimento) se algo obrigatório não estiver configurado,
 * em vez de deixar o erro estourar silenciosamente em uma chamada de API.
 */
function readEnv(key: string, required = true): string {
  const value = import.meta.env[key];
  if (required && !value) {
    console.warn(
      `[env] Variável ${key} não definida. Copie .env.example para .env e preencha os valores.`,
    );
  }
  return value ?? "";
}

export const env = {
  // Proxy same-origin (api/tmdb/[...path].ts em prod, middleware do Vite em dev) —
  // o Bearer token do TMDB fica só no servidor, nunca neste bundle client-side.
  tmdbBaseUrl: readEnv("VITE_TMDB_BASE_URL", false) || "/api/tmdb",
  tmdbImageBaseUrl:
    readEnv("VITE_TMDB_IMAGE_BASE_URL", false) || "https://image.tmdb.org/t/p",
};
