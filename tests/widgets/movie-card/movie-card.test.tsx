import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCard } from "@/widgets/movie-card/movie-card";
import type { Movie } from "@/entities/movie";

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

describe("MovieCard", () => {
  it("exibe título, ano e nota do filme", () => {
    render(<MovieCard movie={buildMovie()} />);

    expect(screen.getByText("Filme Teste")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("usa a imagem de placeholder quando não há poster", () => {
    render(<MovieCard movie={buildMovie({ poster_path: null })} />);

    expect(screen.getByRole("img")).toHaveAttribute("src", "/placeholder-movie.svg");
  });

  it("exibe travessão quando não há data de lançamento", () => {
    render(<MovieCard movie={buildMovie({ release_date: "" })} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("não é clicável quando nenhum onClick é informado", () => {
    render(<MovieCard movie={buildMovie()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("chama onClick com o filme ao clicar no card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MovieCard movie={buildMovie()} onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledWith(buildMovie());
  });

  it("chama onClick ao pressionar Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MovieCard movie={buildMovie()} onClick={onClick} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledWith(buildMovie());
  });
});
