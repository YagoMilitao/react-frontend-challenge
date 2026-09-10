import { useState } from "react";

/**
 * Estado de paginação do grid. `totalPages` vem de fora (resultado da query),
 * então cada clique já calcula a próxima página com o limite atualizado.
 */
export function useMovieGridPagination(totalPages: number, onPageChange?: (page: number) => void) {
  const [page, setPage] = useState(1);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  function goToPreviousPage() {
    if (!canGoPrevious) return;
    const previous = page - 1;
    setPage(previous);
    onPageChange?.(previous);
  }

  function goToNextPage() {
    if (!canGoNext) return;
    const next = page + 1;
    setPage(next);
    onPageChange?.(next);
  }

  return { page, canGoPrevious, canGoNext, goToPreviousPage, goToNextPage };
}
