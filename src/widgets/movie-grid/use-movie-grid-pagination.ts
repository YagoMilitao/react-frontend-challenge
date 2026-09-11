/**
 * Deriva o estado de navegação da paginação a partir da página atual e do total.
 * A página em si é controlada por quem busca os dados (a página precisa do
 * número para montar a query), então este hook não guarda estado próprio.
 */
export function useMovieGridPagination(page: number, totalPages: number) {
  return {
    canGoPrevious: page > 1,
    canGoNext: page < totalPages,
  };
}
