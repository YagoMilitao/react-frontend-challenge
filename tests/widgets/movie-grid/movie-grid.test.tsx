import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieGrid } from "@/widgets/movie-grid/movie-grid";
import type { Movie } from "@/entities/movie";

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

describe("MovieGrid", () => {
  it("exibe skeletons durante o carregamento", () => {
    const { container } = render(
      <MovieGrid movies={[]} isLoading onPageChange={vi.fn()} />,
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("exibe estado vazio quando não há filmes", () => {
    render(<MovieGrid movies={[]} isLoading={false} onPageChange={vi.fn()} />);

    expect(screen.getByText("Nenhum filme encontrado")).toBeInTheDocument();
  });

  it("renderiza um card para cada filme", () => {
    const movies = [buildMovie({ id: 1, title: "A" }), buildMovie({ id: 2, title: "B" })];
    render(<MovieGrid movies={movies} isLoading={false} onPageChange={vi.fn()} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("avança de página ao clicar em Próxima", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <MovieGrid
        movies={[buildMovie()]}
        isLoading={false}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("desabilita o botão Anterior na primeira página", () => {
    render(
      <MovieGrid movies={[buildMovie()]} isLoading={false} totalPages={3} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
  });

  it("chama onMovieClick ao clicar em um card", async () => {
    const user = userEvent.setup();
    const onMovieClick = vi.fn();
    const movie = buildMovie();
    render(
      <MovieGrid
        movies={[movie]}
        isLoading={false}
        onPageChange={vi.fn()}
        onMovieClick={onMovieClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Filme Teste/ }));

    expect(onMovieClick).toHaveBeenCalledWith(movie);
  });
});
