import { Loader2 } from "lucide-react";
import type { Movie } from "@/entities/movie";
import { MovieCard } from "@/widgets/movie-card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { useMovieGridPagination } from "./use-movie-grid-pagination";

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  isError?: boolean;
  /** Refetch em background (ex.: trocando de página) — mantém a lista atual visível, só sinaliza. */
  isFetching?: boolean;
  page: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  onMovieClick?: (movie: Movie) => void;
}

export function MovieGrid({
  movies,
  isLoading,
  isError = false,
  isFetching = false,
  page,
  totalPages = 1,
  onPageChange,
  onMovieClick,
}: MovieGridProps) {
  const { canGoPrevious, canGoNext } = useMovieGridPagination(page, totalPages);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-destructive/50 py-16 text-center">
        <p className="text-sm font-medium text-destructive">Não foi possível carregar os filmes</p>
        <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">Nenhum filme encontrado</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou a busca.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
        >
          Anterior
        </Button>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          Página {page} de {totalPages}
          {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Atualizando" />}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
