import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MovieGrid } from "@/widgets/movie-grid/movie-grid";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import type { Movie } from "@/entities/movie";

vi.mock("@/shared/api/http-client", () => ({
  tmdbClient: { get: vi.fn().mockResolvedValue({}) },
}));

function buildMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: "Filme Teste",
    original_title: "Test Movie",
    overview: "Uma sinopse qualquer.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2020-05-10",
    vote_average: 8,
    vote_count: 1000,
    genre_ids: [28],
    popularity: 100,
    adult: false,
    original_language: "en",
    ...overrides,
  };
}

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("MovieGrid", () => {
  beforeEach(() => {
    useWatchlistStore.setState({ movies: [] });
  });

  it("exibe skeletons durante o carregamento", () => {
    const { container } = renderWithQueryClient(
      <MovieGrid movies={[]} isLoading page={1} onPageChange={vi.fn()} />,
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("exibe estado vazio quando não há filmes", () => {
    renderWithQueryClient(<MovieGrid movies={[]} isLoading={false} page={1} onPageChange={vi.fn()} />);

    expect(screen.getByText("Nenhum filme encontrado")).toBeInTheDocument();
  });

  it("exibe estado de erro quando isError é true, mesmo sem filmes", () => {
    renderWithQueryClient(
      <MovieGrid movies={[]} isLoading={false} isError page={1} onPageChange={vi.fn()} />,
    );

    expect(screen.getByText("Não foi possível carregar os filmes")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum filme encontrado")).not.toBeInTheDocument();
  });

  it("exibe um indicador de atualização quando isFetching é true em background", () => {
    renderWithQueryClient(
      <MovieGrid
        movies={[buildMovie()]}
        isLoading={false}
        isFetching
        page={1}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Atualizando")).toBeInTheDocument();
  });

  it("não exibe o indicador de atualização quando isFetching é false", () => {
    renderWithQueryClient(
      <MovieGrid movies={[buildMovie()]} isLoading={false} page={1} onPageChange={vi.fn()} />,
    );

    expect(screen.queryByLabelText("Atualizando")).not.toBeInTheDocument();
  });

  it("renderiza um card para cada filme", () => {
    const movies = [buildMovie({ id: 1, title: "A" }), buildMovie({ id: 2, title: "B" })];
    renderWithQueryClient(<MovieGrid movies={movies} isLoading={false} page={1} onPageChange={vi.fn()} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("exibe a página atual e o total de páginas", () => {
    renderWithQueryClient(
      <MovieGrid
        movies={[buildMovie()]}
        isLoading={false}
        page={2}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("chama onPageChange com a próxima página ao clicar em Próxima", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithQueryClient(
      <MovieGrid
        movies={[buildMovie()]}
        isLoading={false}
        page={1}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("chama onPageChange com a página anterior ao clicar em Anterior", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithQueryClient(
      <MovieGrid
        movies={[buildMovie()]}
        isLoading={false}
        page={2}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Anterior" }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("desabilita o botão Anterior na primeira página", () => {
    renderWithQueryClient(
      <MovieGrid
        movies={[buildMovie()]}
        isLoading={false}
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
  });

  it("desabilita o botão Próxima na última página", () => {
    renderWithQueryClient(
      <MovieGrid
        movies={[buildMovie()]}
        isLoading={false}
        page={3}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
  });

  it("chama onMovieClick ao clicar em um card", async () => {
    const user = userEvent.setup();
    const onMovieClick = vi.fn();
    const movie = buildMovie();
    renderWithQueryClient(
      <MovieGrid
        movies={[movie]}
        isLoading={false}
        page={1}
        onPageChange={vi.fn()}
        onMovieClick={onMovieClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Filme Teste/ }));

    expect(onMovieClick).toHaveBeenCalledWith(movie);
  });
});
