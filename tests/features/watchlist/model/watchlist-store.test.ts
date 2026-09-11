import { describe, it, expect, beforeEach } from "vitest";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import type { Movie } from "@/entities/movie";

function buildMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: "Filme Teste",
    original_title: "Test Movie",
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2020-01-01",
    vote_average: 7,
    vote_count: 10,
    genre_ids: [28],
    popularity: 10,
    adult: false,
    original_language: "en",
    ...overrides,
  };
}

describe("watchlist-store", () => {
  beforeEach(() => {
    useWatchlistStore.setState({ movies: [] });
  });

  it("começa vazia", () => {
    expect(useWatchlistStore.getState().movies).toEqual([]);
  });

  it("adiciona um filme", () => {
    useWatchlistStore.getState().addMovie(buildMovie());

    expect(useWatchlistStore.getState().movies).toHaveLength(1);
    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(true);
  });

  it("não duplica um filme já adicionado", () => {
    const store = useWatchlistStore.getState();
    store.addMovie(buildMovie());
    store.addMovie(buildMovie());

    expect(useWatchlistStore.getState().movies).toHaveLength(1);
  });

  it("remove um filme", () => {
    const store = useWatchlistStore.getState();
    store.addMovie(buildMovie());
    store.removeMovie(1);

    expect(useWatchlistStore.getState().movies).toEqual([]);
    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(false);
  });

  it("toggleMovie adiciona quando ainda não está na lista", () => {
    useWatchlistStore.getState().toggleMovie(buildMovie());

    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(true);
  });

  it("toggleMovie remove quando já está na lista", () => {
    const store = useWatchlistStore.getState();
    store.toggleMovie(buildMovie());
    store.toggleMovie(buildMovie());

    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(false);
  });

  it("mantém filmes diferentes ao adicionar mais de um", () => {
    const store = useWatchlistStore.getState();
    store.addMovie(buildMovie({ id: 1, title: "A" }));
    store.addMovie(buildMovie({ id: 2, title: "B" }));

    expect(useWatchlistStore.getState().movies.map((m) => m.id)).toEqual([1, 2]);
  });
});
