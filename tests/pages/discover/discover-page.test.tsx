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
import { DiscoverPage } from "@/pages/discover/discover-page";
import { useDiscoverFilterStore } from "@/features/discover-filter";
import type { Movie, PaginatedResponse } from "@/shared/api/tmdb-types";

vi.mock("@/shared/api/http-client", () => ({
  tmdbClient: { get: vi.fn() },
}));

import { tmdbClient } from "@/shared/api/http-client";

function buildMovies(titles: string[], page = 1, totalPages = 1): PaginatedResponse<Movie> {
  return {
    page,
    total_pages: totalPages,
    total_results: titles.length,
    results: titles.map((title, index) => ({
      id: index + 1,
      title,
      original_title: title,
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
    })),
  };
}

function renderPage() {
  const rootRoute = createRootRoute();
  const discoverRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: DiscoverPage,
  });
  const movieDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/movie/$id",
    component: function MovieDetailsStub() {
      const { id } = movieDetailsRoute.useParams();
      return <div>Detalhes do filme {id}</div>;
    },
  });
  const routeTree = rootRoute.addChildren([discoverRoute, movieDetailsRoute]);
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ["/"] }) });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDiscoverFilterStore.getState().reset();

    vi.mocked(tmdbClient.get).mockImplementation(async (path, params) => {
      const page = (params?.page as number | undefined) ?? 1;

      if (path === "/genre/movie/list") {
        return {
          genres: [
            { id: 28, name: "Ação" },
            { id: 35, name: "Comédia" },
          ],
        };
      }
      if (path === "/trending/movie/day") {
        return page === 2
          ? buildMovies(["Trending Página 2"], 2, 2)
          : buildMovies(["Trending A", "Trending B"], 1, 2);
      }
      if (path === "/discover/movie") {
        return buildMovies(["Popular Filtrado"], 1, 1);
      }
      if (path === "/search/movie") {
        return buildMovies(["Matrix"], 1, 1);
      }
      return buildMovies([]);
    });
  });

  it("exibe filmes em tendência por padrão", async () => {
    renderPage();

    expect(await screen.findByText("Trending A")).toBeInTheDocument();
    expect(screen.getByText("Trending B")).toBeInTheDocument();
  });

  it("busca filmes após o debounce ao digitar", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Trending A");
    await user.type(screen.getByRole("searchbox"), "matrix");

    expect(await screen.findByText("Matrix", {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.queryByText("Trending A")).not.toBeInTheDocument();
  });

  it("aplica o filtro de gênero e troca para a listagem popular", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Trending A");
    await user.click(await screen.findByLabelText("Ação"));

    expect(await screen.findByText("Popular Filtrado")).toBeInTheDocument();
    expect(screen.queryByText("Trending A")).not.toBeInTheDocument();
  });

  it("pagina para a próxima página mantendo o mesmo tipo de listagem", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Trending A");
    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(await screen.findByText("Trending Página 2")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it("volta para a página 1 ao aplicar um filtro depois de paginar", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Trending A");
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    await screen.findByText("Trending Página 2");

    await user.click(await screen.findByLabelText("Comédia"));

    expect(await screen.findByText("Popular Filtrado")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });

  it("navega para os detalhes do filme ao clicar em um card", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Trending A");
    await user.click(screen.getByRole("button", { name: /Trending A/ }));

    expect(await screen.findByText("Detalhes do filme 1")).toBeInTheDocument();
  });
});
