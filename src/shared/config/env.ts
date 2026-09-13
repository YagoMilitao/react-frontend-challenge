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
  tmdbReadToken: readEnv("VITE_TMDB_API_READ_TOKEN"),
  tmdbBaseUrl: readEnv("VITE_TMDB_BASE_URL", false) || "https://api.themoviedb.org/3",
  tmdbImageBaseUrl:
    readEnv("VITE_TMDB_IMAGE_BASE_URL", false) || "https://image.tmdb.org/t/p",
};
