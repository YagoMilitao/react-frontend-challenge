import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Movie, MovieDetails } from "@/entities/movie";

type WatchlistCandidate = Movie | MovieDetails;

interface WatchlistState {
  movies: Movie[];
  addMovie: (movie: WatchlistCandidate) => void;
  removeMovie: (movieId: number) => void;
  toggleMovie: (movie: WatchlistCandidate) => void;
  isInWatchlist: (movieId: number) => boolean;
}

/**
 * A listagem (Movie) traz `genre_ids`; o endpoint de detalhes do TMDB (MovieDetails)
 * não traz esse campo, só `genres` (objetos {id, name}). Um filme pode entrar na
 * watchlist a partir de qualquer uma das duas telas, então normalizamos aqui para
 * sempre guardar `genre_ids`, que é o que a tabela da watchlist espera.
 */
function normalizeMovie(movie: WatchlistCandidate): Movie {
  const genres = (movie as MovieDetails).genres;
  const genre_ids = Array.isArray(genres)
    ? genres.map((genre) => genre.id)
    : ((movie as Movie).genre_ids ?? []);

  return { ...movie, genre_ids };
}

/**
 * Guarda o filme completo (não só o id) para renderizar a tabela da watchlist
 * sem depender de uma nova consulta à API. Persistido: é o requisito central
 * da feature — a lista precisa sobreviver ao reload da página.
 */
export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      movies: [],
      addMovie: (movie) =>
        set((state) =>
          state.movies.some((item) => item.id === movie.id)
            ? state
            : { movies: [...state.movies, normalizeMovie(movie)] },
        ),
      removeMovie: (movieId) =>
        set((state) => ({ movies: state.movies.filter((item) => item.id !== movieId) })),
      toggleMovie: (movie) => {
        const { movies, addMovie, removeMovie } = get();
        if (movies.some((item) => item.id === movie.id)) {
          removeMovie(movie.id);
        } else {
          addMovie(movie);
        }
      },
      isInWatchlist: (movieId) => get().movies.some((item) => item.id === movieId),
    }),
    { name: "cinedash-watchlist" },
  ),
);
