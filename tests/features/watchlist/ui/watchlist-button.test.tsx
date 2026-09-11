import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WatchlistButton } from "@/features/watchlist/ui/watchlist-button";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import type { Movie } from "@/entities/movie";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

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

describe("WatchlistButton", () => {
  beforeEach(() => {
    useWatchlistStore.setState({ movies: [] });
    vi.clearAllMocks();
  });

  it("indica que o filme não está na lista", () => {
    render(<WatchlistButton movie={buildMovie()} />);

    expect(screen.getByRole("button", { name: "Adicionar à minha lista" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("adiciona o filme à lista ao clicar", async () => {
    const user = userEvent.setup();
    render(<WatchlistButton movie={buildMovie()} />);

    await user.click(screen.getByRole("button", { name: "Adicionar à minha lista" }));

    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(true);
  });

  it("remove o filme da lista ao clicar quando já está adicionado", async () => {
    useWatchlistStore.getState().addMovie(buildMovie());
    const user = userEvent.setup();
    render(<WatchlistButton movie={buildMovie()} />);

    await user.click(screen.getByRole("button", { name: "Remover da minha lista" }));

    expect(useWatchlistStore.getState().isInWatchlist(1)).toBe(false);
  });

  it("não propaga o clique para elementos pai", async () => {
    const user = userEvent.setup();
    let parentClicked = false;

    render(
      <div onClick={() => (parentClicked = true)}>
        <WatchlistButton movie={buildMovie()} />
      </div>,
    );

    await user.click(screen.getByRole("button"));

    expect(parentClicked).toBe(false);
  });

  it("exibe o texto quando withLabel é true", () => {
    render(<WatchlistButton movie={buildMovie()} withLabel />);

    expect(screen.getByText("Adicionar à minha lista")).toBeInTheDocument();
  });

  it("troca o texto para 'Na minha lista' quando já está adicionado", () => {
    useWatchlistStore.getState().addMovie(buildMovie());
    render(<WatchlistButton movie={buildMovie()} withLabel />);

    expect(screen.getByText("Na minha lista")).toBeInTheDocument();
  });

  it("exibe um toast de sucesso ao adicionar", async () => {
    const user = userEvent.setup();
    render(<WatchlistButton movie={buildMovie()} />);

    await user.click(screen.getByRole("button", { name: "Adicionar à minha lista" }));

    expect(toast.success).toHaveBeenCalledWith(
      "Adicionado à minha lista.",
      expect.objectContaining({ description: "Filme Teste" }),
    );
  });

  it("exibe um toast de sucesso ao remover", async () => {
    useWatchlistStore.getState().addMovie(buildMovie());
    const user = userEvent.setup();
    render(<WatchlistButton movie={buildMovie()} />);

    await user.click(screen.getByRole("button", { name: "Remover da minha lista" }));

    expect(toast.success).toHaveBeenCalledWith(
      "Removido da minha lista.",
      expect.objectContaining({ description: "Filme Teste" }),
    );
  });
});
