import { Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchMovieDetails } from "@/entities/movie";
import type { Movie } from "@/entities/movie";
import { getImageUrl } from "@/shared/lib/image-url";
import { Card } from "@/shared/ui/card";
import { ImagePlaceholder } from "@/shared/ui/image-placeholder";
import { cn } from "@/shared/lib/utils";
import { WatchlistButton } from "@/features/watchlist";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const posterUrl = getImageUrl(movie.poster_path, "w342");
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
        "group relative aspect-[2/3] w-full overflow-hidden",
        onClick &&
          "cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <ImagePlaceholder />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3 pt-12">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-white" title={movie.title}>
          {movie.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-xs text-white/80">
          <span>{releaseYear}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>

      <WatchlistButton movie={movie} className="absolute right-2 top-2 shadow-md" />
    </Card>
  );
}
