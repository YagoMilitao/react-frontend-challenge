import { Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchMovieDetails } from "@/entities/movie";
import type { Movie } from "@/entities/movie";
import { getImageUrl } from "@/shared/lib/image-url";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { WatchlistButton } from "@/features/watchlist";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const queryClient = useQueryClient();

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(movie);
    }
  }

  // Prefetch dos detalhes no hover/foco: quando o usuário de fato clicar, a
  // página de detalhes já encontra o cache quente e renderiza na hora.
  function handlePrefetch() {
    prefetchMovieDetails(queryClient, movie.id);
  }

  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? () => onClick(movie) : undefined}
      onKeyDown={handleKeyDown}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className={cn(
        "flex flex-col overflow-hidden transition-transform",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        <img
          src={getImageUrl(movie.poster_path, "w342")}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <WatchlistButton movie={movie} className="absolute right-2 top-2 shadow-md" />
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight" title={movie.title}>
          {movie.title}
        </h3>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>{releaseYear}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
