import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { useMovieCredits, useMovieDetails, useMovieVideos } from "@/entities/movie";
import { WatchlistButton } from "@/features/watchlist";
import { getImageUrl } from "@/shared/lib/image-url";
import { Skeleton } from "@/shared/ui/skeleton";

function BackLink() {
  return (
    <Link
      to="/discover"
      className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar para Descobrir
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="container flex flex-col gap-6 py-8">
      <Skeleton className="h-4 w-40" />
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="container flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-lg font-medium">Filme não encontrado</p>
      <BackLink />
    </div>
  );
}

export function MovieDetailsPage() {
  const params = useParams({ strict: false });
  const movieId = Number(params.id);
  const isValidId = Number.isFinite(movieId);

  const detailsQuery = useMovieDetails(isValidId ? movieId : null);
  const creditsQuery = useMovieCredits(isValidId ? movieId : null);
  const videosQuery = useMovieVideos(isValidId ? movieId : null);

  if (!isValidId) {
    return <NotFoundState />;
  }

  if (detailsQuery.isLoading) {
    return <LoadingState />;
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return <NotFoundState />;
  }

  const movie = detailsQuery.data;
  const trailer = videosQuery.data?.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const cast = creditsQuery.data?.cast.slice(0, 10) ?? [];

  return (
    <div className="container flex flex-col gap-6 py-8">
      <BackLink />

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <img
          src={getImageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          className="w-full rounded-lg border border-border object-cover"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">{movie.title}</h1>
            {movie.tagline && <p className="italic text-muted-foreground">{movie.tagline}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </span>
            <span>{movie.release_date ? movie.release_date.slice(0, 4) : "—"}</span>
            {movie.runtime > 0 && <span>{movie.runtime} min</span>}
            {movie.genres.length > 0 && <span>{movie.genres.map((genre) => genre.name).join(", ")}</span>}
          </div>

          <WatchlistButton movie={movie} withLabel className="w-fit" />

          <p className="max-w-prose text-sm leading-relaxed">
            {movie.overview || "Sinopse não disponível."}
          </p>

          {cast.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Elenco</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {cast.map((member) => (
                  <div key={member.id} className="flex w-24 flex-shrink-0 flex-col gap-1 text-center">
                    <img
                      src={getImageUrl(member.profile_path, "w185")}
                      alt={member.name}
                      className="aspect-[2/3] w-full rounded-md border border-border object-cover"
                    />
                    <span className="line-clamp-2 text-xs font-medium leading-tight">{member.name}</span>
                    <span className="line-clamp-2 text-xs leading-tight text-muted-foreground">
                      {member.character}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trailer && (
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Trailer</h2>
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
