import { Bookmark, BookmarkCheck } from "lucide-react";
import type { Movie } from "@/entities/movie";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useWatchlistStore } from "../model/watchlist-store";

interface WatchlistButtonProps {
  movie: Movie;
  className?: string;
}

export function WatchlistButton({ movie, className }: WatchlistButtonProps) {
  const isInWatchlist = useWatchlistStore((state) => state.isInWatchlist(movie.id));
  const toggleMovie = useWatchlistStore((state) => state.toggleMovie);

  return (
    <Button
      type="button"
      variant={isInWatchlist ? "default" : "secondary"}
      size="icon"
      className={cn("h-8 w-8", className)}
      aria-label={isInWatchlist ? "Remover da minha lista" : "Adicionar à minha lista"}
      aria-pressed={isInWatchlist}
      onClick={(event) => {
        event.stopPropagation();
        toggleMovie(movie);
      }}
    >
      {isInWatchlist ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </Button>
  );
}
