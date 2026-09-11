import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MovieCard } from "@/widgets/movie-card/movie-card";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import type { Movie } from "@/entities/movie";

vi.mock("@/shared/api/http-client", () => ({
  tmdbClient: { get: vi.fn().mockResolvedValue({}) },
}));

import { tmdbClient } from "@/shared/api/http-client";

function buildMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: "Filme Teste",
    original_title: "Test Movie",
    overview: "Uma sinopse qualquer.",
    poster_path: "/poster.jpg",
    backdrop_path: null,
    release_date: "2020-05-10",
    vote_average: 8.456,
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

describe("MovieCard", () => {
  beforeEach(() => {
    useWatchlistStore.setState({ movies: [] });
    vi.clearAllMocks();
  });

  it("exibe título, ano e nota do filme", () => {
    renderWithQueryClient(<MovieCard movie={buildMovie()} />);

    expect(screen.getByText("Filme Teste")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("exibe o placeholder visual quando não há poster", () => {
    renderWithQueryClient(<MovieCard movie={buildMovie({ poster_path: null })} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("exibe a imagem do poster quando disponível", () => {
    renderWithQueryClient(<MovieCard movie={buildMovie({ poster_path: "/poster.jpg" })} />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("/poster.jpg"),
    );
  });

  it("exibe travessão quando não há data de lançamento", () => {
    renderWithQueryClient(<MovieCard movie={buildMovie({ release_date: "" })} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("não é clicável quando nenhum onClick é informado", () => {
    renderWithQueryClient(<MovieCard movie={buildMovie()} />);

    // o botão de watchlist continua presente; o card em si não vira role="button"
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button")).toHaveAccessibleName("Adicionar à minha lista");
  });

  it("chama onClick com o filme ao clicar no card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithQueryClient(<MovieCard movie={buildMovie()} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: /Filme Teste/ }));

    expect(onClick).toHaveBeenCalledWith(buildMovie());
  });

  it("chama onClick ao pressionar Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithQueryClient(<MovieCard movie={buildMovie()} onClick={onClick} />);

    const card = screen.getByRole("button", { name: /Filme Teste/ });
    card.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledWith(buildMovie());
  });

  it("o clique no botão de watchlist não dispara o onClick do card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithQueryClient(<MovieCard movie={buildMovie()} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Adicionar à minha lista" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("faz prefetch dos detalhes do filme ao passar o mouse sobre o card", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<MovieCard movie={buildMovie()} onClick={vi.fn()} />);

    await user.hover(screen.getByRole("button", { name: /Filme Teste/ }));

    expect(tmdbClient.get).toHaveBeenCalledWith("/movie/1", { language: "pt-BR" });
  });

  it("faz prefetch dos detalhes do filme ao focar o card via teclado", () => {
    renderWithQueryClient(<MovieCard movie={buildMovie()} onClick={vi.fn()} />);

    screen.getByRole("button", { name: /Filme Teste/ }).focus();

    expect(tmdbClient.get).toHaveBeenCalledWith("/movie/1", { language: "pt-BR" });
  });
});
