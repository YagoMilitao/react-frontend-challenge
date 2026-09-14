/**
 * Wrapper fino sobre `console`, para ter um único ponto de saída dos logs do
 * client (facilita trocar por um serviço de error tracking depois) e para
 * distinguir avisos de dev (silenciados em produção) de erros de runtime
 * (sempre logados, já que ajudam a depurar problemas reportados por usuários).
 */
export const logger = {
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
