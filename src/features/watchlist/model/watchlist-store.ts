import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Movie } from "@/entities/movie";

interface WatchlistState {
  movies: Movie[];
  addMovie: (movie: Movie) => void;
  removeMovie: (movieId: number) => void;
  toggleMovie: (movie: Movie) => void;
  isInWatchlist: (movieId: number) => boolean;
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
            : { movies: [...state.movies, movie] },
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
