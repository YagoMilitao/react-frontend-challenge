import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WatchlistTable } from "@/widgets/watchlist-table/watchlist-table";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import type { Movie } from "@/entities/movie";

vi.mock("@/shared/api/http-client", () => ({
  tmdbClient: {
    get: vi.fn().mockResolvedValue({
      genres: [
        { id: 28, name: "Ação" },
        { id: 18, name: "Drama" },
      ],
    }),
  },
}));

function buildMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: "Filme B",
    original_title: "Movie B",
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2020-06-01",
    vote_average: 5,
    vote_count: 10,
    genre_ids: [28],
    popularity: 10,
    adult: false,
    original_language: "en",
    ...overrides,
  };
}

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("WatchlistTable", () => {
  beforeEach(() => {
    useWatchlistStore.setState({ movies: [] });
  });

  it("exibe estado vazio quando não há filmes na lista", () => {
    renderWithQueryClient(<WatchlistTable />);

    expect(screen.getByText("Sua lista está vazia")).toBeInTheDocument();
  });

  it("lista os filmes da watchlist com o gênero resolvido", async () => {
    useWatchlistStore.getState().addMovie(buildMovie());
    renderWithQueryClient(<WatchlistTable />);

    expect(await screen.findByText("Filme B")).toBeInTheDocument();
    expect(await screen.findByText("Ação")).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("remove um filme ao clicar no botão de remover", async () => {
    useWatchlistStore.getState().addMovie(buildMovie());
    const user = userEvent.setup();
    renderWithQueryClient(<WatchlistTable />);

    await screen.findByText("Filme B");
    await user.click(screen.getByRole("button", { name: "Remover Filme B da minha lista" }));

    expect(useWatchlistStore.getState().movies).toEqual([]);
    expect(screen.getByText("Sua lista está vazia")).toBeInTheDocument();
  });

  it("ordena por título ao clicar no cabeçalho", async () => {
    const store = useWatchlistStore.getState();
    store.addMovie(buildMovie({ id: 1, title: "Zebra" }));
    store.addMovie(buildMovie({ id: 2, title: "Abelha" }));

    const user = userEvent.setup();
    renderWithQueryClient(<WatchlistTable />);

    await screen.findByText("Zebra");

    await user.click(screen.getByRole("button", { name: "Ordenar por Título" }));

    const rows = screen.getAllByRole("row").slice(1); // ignora o cabeçalho
    expect(within(rows[0]).getByText("Abelha")).toBeInTheDocument();
  });
});
