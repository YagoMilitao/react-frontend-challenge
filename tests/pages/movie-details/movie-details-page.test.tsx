import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { MovieDetailsPage } from "@/pages/movie-details/movie-details-page";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import type { Credits, MovieDetails, Videos } from "@/shared/api/tmdb-types";

vi.mock("@/shared/api/http-client", () => ({
  tmdbClient: { get: vi.fn() },
}));

import { tmdbClient } from "@/shared/api/http-client";

function buildDetails(overrides: Partial<MovieDetails> = {}): MovieDetails {
  return {
    id: 42,
    title: "Filme Detalhado",
    original_title: "Detailed Movie",
    overview: "Uma sinopse completa.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2020-05-10",
    vote_average: 8.2,
    vote_count: 1000,
    genre_ids: [28],
    popularity: 100,
    adult: false,
    original_language: "en",
    budget: 1000,
    revenue: 2000,
    runtime: 120,
    status: "Released",
    tagline: "Uma tagline qualquer",
    genres: [{ id: 28, name: "Ação" }],
    production_companies: [],
    spoken_languages: [],
    homepage: null,
    imdb_id: null,
    ...overrides,
  };
}

function buildCredits(): Credits {
  return {
    cast: [
      { id: 1, name: "Atriz Um", character: "Personagem Um", profile_path: null, order: 0 },
      { id: 2, name: "Ator Dois", character: "Personagem Dois", profile_path: null, order: 1 },
    ],
    crew: [],
  };
}

function buildVideos(hasTrailer = true): Videos {
  return {
    results: hasTrailer
      ? [
          {
            id: "v1",
            name: "Trailer Oficial",
            key: "abc123",
            site: "YouTube",
            type: "Trailer",
            official: true,
            published_at: "2020-01-01",
          },
        ]
      : [],
  };
}

function renderMovieDetailsPage(path: string) {
  const rootRoute = createRootRoute();
  const detailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/movie/$id",
    component: MovieDetailsPage,
  });
  const discoverRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/discover",
    component: () => <div>Página de descoberta</div>,
  });
  const routeTree = rootRoute.addChildren([detailsRoute, discoverRoute]);
  const history = createMemoryHistory({ initialEntries: [path] });
  const router = createRouter({ routeTree, history });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("MovieDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWatchlistStore.setState({ movies: [] });

    vi.mocked(tmdbClient.get).mockImplementation(async (path: string) => {
      if (path === "/movie/42") return buildDetails();
      if (path === "/movie/42/credits") return buildCredits();
      if (path === "/movie/42/videos") return buildVideos();
      throw new Error(`unexpected path in test: ${path}`);
    });
  });

  it("exibe os detalhes do filme", async () => {
    renderMovieDetailsPage("/movie/42");

    expect(await screen.findByRole("heading", { name: "Filme Detalhado" })).toBeInTheDocument();
    expect(screen.getByText("Uma tagline qualquer")).toBeInTheDocument();
    expect(screen.getByText("Uma sinopse completa.")).toBeInTheDocument();
    expect(screen.getByText("8.2")).toBeInTheDocument();
    expect(screen.getByText("120 min")).toBeInTheDocument();
    expect(screen.getByText("Ação")).toBeInTheDocument();
  });

  it("exibe o elenco", async () => {
    renderMovieDetailsPage("/movie/42");

    expect(await screen.findByText("Atriz Um")).toBeInTheDocument();
    expect(screen.getByText("Personagem Um")).toBeInTheDocument();
    expect(screen.getByText("Ator Dois")).toBeInTheDocument();
  });

  it("exibe o trailer quando disponível", async () => {
    renderMovieDetailsPage("/movie/42");

    const iframe = await screen.findByTitle("Trailer Oficial");
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/abc123");
  });

  it("não exibe a seção de trailer quando não há vídeo", async () => {
    vi.mocked(tmdbClient.get).mockImplementation(async (path: string) => {
      if (path === "/movie/42") return buildDetails();
      if (path === "/movie/42/credits") return buildCredits();
      if (path === "/movie/42/videos") return buildVideos(false);
      throw new Error(`unexpected path in test: ${path}`);
    });

    renderMovieDetailsPage("/movie/42");

    await screen.findByRole("heading", { name: "Filme Detalhado" });
    expect(screen.queryByText("Trailer")).not.toBeInTheDocument();
  });

  it("adiciona o filme à watchlist ao clicar no botão", async () => {
    const user = userEvent.setup();
    renderMovieDetailsPage("/movie/42");

    await screen.findByRole("heading", { name: "Filme Detalhado" });
    await user.click(screen.getByRole("button", { name: "Adicionar à minha lista" }));

    expect(useWatchlistStore.getState().isInWatchlist(42)).toBe(true);
    expect(await screen.findByText("Na minha lista")).toBeInTheDocument();
  });

  it("exibe estado de não encontrado quando o id não é válido", async () => {
    renderMovieDetailsPage("/movie/abc");

    expect(await screen.findByText("Filme não encontrado")).toBeInTheDocument();
  });

  it("exibe estado de não encontrado quando a API falha", async () => {
    vi.mocked(tmdbClient.get).mockRejectedValue(new Error("not found"));

    renderMovieDetailsPage("/movie/999");

    expect(await screen.findByText("Filme não encontrado")).toBeInTheDocument();
  });

  it("exibe aviso quando o elenco falha ao carregar, sem impedir o resto da página", async () => {
    vi.mocked(tmdbClient.get).mockImplementation(async (path: string) => {
      if (path === "/movie/42") return buildDetails();
      if (path === "/movie/42/credits") throw new Error("credits failed");
      if (path === "/movie/42/videos") return buildVideos();
      throw new Error(`unexpected path in test: ${path}`);
    });

    renderMovieDetailsPage("/movie/42");

    expect(await screen.findByText("Não foi possível carregar o elenco.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Filme Detalhado" })).toBeInTheDocument();
  });

  it("exibe aviso quando o trailer falha ao carregar, sem impedir o resto da página", async () => {
    vi.mocked(tmdbClient.get).mockImplementation(async (path: string) => {
      if (path === "/movie/42") return buildDetails();
      if (path === "/movie/42/credits") return buildCredits();
      if (path === "/movie/42/videos") throw new Error("videos failed");
      throw new Error(`unexpected path in test: ${path}`);
    });

    renderMovieDetailsPage("/movie/42");

    expect(await screen.findByText("Não foi possível carregar o trailer.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Filme Detalhado" })).toBeInTheDocument();
  });
});
