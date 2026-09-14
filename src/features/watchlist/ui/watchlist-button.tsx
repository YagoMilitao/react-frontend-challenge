import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import type { Movie, MovieDetails } from "@/entities/movie";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useWatchlistStore } from "../model/watchlist-store";

interface WatchlistButtonProps {
  movie: Movie | MovieDetails;
  className?: string;
  /** Exibe o texto ao lado do ícone — usado na página de detalhes como CTA principal. */
  withLabel?: boolean;
}

export function WatchlistButton({ movie, className, withLabel = false }: WatchlistButtonProps) {
  const isInWatchlist = useWatchlistStore((state) => state.isInWatchlist(movie.id));
  const toggleMovie = useWatchlistStore((state) => state.toggleMovie);

  return (
    <Button
      type="button"
      variant={isInWatchlist ? "default" : "secondary"}
      size={withLabel ? "default" : "icon"}
      className={cn(!withLabel && "h-8 w-8", className)}
      aria-label={isInWatchlist ? "Remover da minha lista" : "Adicionar à minha lista"}
      aria-pressed={isInWatchlist}
      onClick={(event) => {
        event.stopPropagation();
        toggleMovie(movie);
        toast.success(
          isInWatchlist ? "Removido da minha lista." : "Adicionado à minha lista.",
          { description: movie.title },
        );
      }}
    >
      {isInWatchlist ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {withLabel && (isInWatchlist ? "Na minha lista" : "Adicionar à minha lista")}
    </Button>
  );
}
