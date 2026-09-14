import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, Star } from "lucide-react";
import { useMovieCredits, useMovieDetails, useMovieVideos } from "@/entities/movie";
import { WatchlistButton } from "@/features/watchlist";
import { TMDBHttpError } from "@/shared/api/http-client";
import { getImageUrl } from "@/shared/lib/image-url";
import { ImagePlaceholder } from "@/shared/ui/image-placeholder";
import { Skeleton } from "@/shared/ui/skeleton";

function BackLink({ className }: { className?: string }) {
  return (
    <Link
      to="/discover"
      className={`inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground ${className ?? ""}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar para Descobrir
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Skeleton className="h-72 w-full rounded-none sm:h-96 md:h-[420px]" />
      <div className="container flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
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

function ErrorState() {
  return (
    <div className="container flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-lg font-medium">Não foi possível carregar este filme</p>
      <p className="text-sm text-muted-foreground">Tente novamente mais tarde.</p>
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

  if (detailsQuery.isError) {
    const isNotFound = detailsQuery.error instanceof TMDBHttpError && detailsQuery.error.status === 404;
    return isNotFound ? <NotFoundState /> : <ErrorState />;
  }

  if (!detailsQuery.data) {
    return <NotFoundState />;
  }

  const movie = detailsQuery.data;
  const backdropUrl = getImageUrl(movie.backdrop_path, "w1280");
  const posterUrl = getImageUrl(movie.poster_path, "w342");
  const trailer = videosQuery.data?.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const cast = creditsQuery.data?.cast.slice(0, 10) ?? [];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="relative h-72 w-full overflow-hidden sm:h-96 md:h-[420px]">
        {backdropUrl ? (
          <img src={backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/10" />

        <div className="container absolute inset-0 flex flex-col justify-between py-6">
          <BackLink className="bg-background/60 w-fit rounded-md px-2 py-1 backdrop-blur-sm" />

          <div className="flex flex-col gap-3 md:max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{movie.title}</h1>
            {movie.tagline && <p className="italic text-muted-foreground">{movie.tagline}</p>}

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </span>
              <span>{movie.release_date ? movie.release_date.slice(0, 4) : "—"}</span>
              {movie.runtime > 0 && <span>{movie.runtime} min</span>}
              {movie.genres.length > 0 && (
                <span>{movie.genres.map((genre) => genre.name).join(", ")}</span>
              )}
            </div>

            <WatchlistButton movie={movie} withLabel className="w-fit" />
          </div>
        </div>
      </div>

      <div className="container flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="hidden aspect-[2/3] w-full overflow-hidden rounded-lg border border-border md:block">
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" />
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          <p className="max-w-prose text-sm leading-relaxed">
            {movie.overview || "Sinopse não disponível."}
          </p>
        </div>

        {creditsQuery.isError && (
          <p className="text-sm text-muted-foreground">Não foi possível carregar o elenco.</p>
        )}

        {cast.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Elenco</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {cast.map((member) => {
                const profileUrl = getImageUrl(member.profile_path, "w185");
                return (
                  <div key={member.id} className="flex w-24 flex-shrink-0 flex-col gap-1 text-center">
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-md border border-border">
                      {profileUrl ? (
                        <img
                          src={profileUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </div>
                    <span className="line-clamp-2 text-xs font-medium leading-tight">
                      {member.name}
                    </span>
                    <span className="line-clamp-2 text-xs leading-tight text-muted-foreground">
                      {member.character}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {videosQuery.isError && (
          <p className="text-sm text-muted-foreground">Não foi possível carregar o trailer.</p>
        )}

        {trailer && (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Trailer</h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
              </div>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="relative h-full w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
