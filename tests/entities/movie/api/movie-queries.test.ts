import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useTrendingMovies,
  usePopularMovies,
  useSearchMovies,
  useGenres,
} from "@/entities/movie/api/movie-queries";

vi.mock("@/shared/api/http-client", () => ({
  tmdbClient: {
    get: vi.fn(),
  },
}));

import { tmdbClient } from "@/shared/api/http-client";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("movie-queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useTrendingMovies", () => {
    it("busca filmes em tendência para a página informada", async () => {
      const mockData = {
        results: [{ id: 1, title: "Filme Teste" }],
        page: 1,
        total_pages: 10,
        total_results: 200,
      };
      vi.mocked(tmdbClient.get).mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useTrendingMovies(2), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tmdbClient.get).toHaveBeenCalledWith("/trending/movie/day", {
        page: 2,
        language: "pt-BR",
      });
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("usePopularMovies", () => {
    it("monta os parâmetros de filtro corretamente", async () => {
      vi.mocked(tmdbClient.get).mockResolvedValueOnce({
        results: [],
        page: 1,
        total_pages: 1,
        total_results: 0,
      });

      const { result } = renderHook(
        () =>
          usePopularMovies(1, {
            selectedGenres: [28, 12],
            year: 2020,
            minRating: 7,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tmdbClient.get).toHaveBeenCalledWith("/discover/movie", {
        page: 1,
        language: "pt-BR",
        sort_by: "popularity.desc",
        with_genres: "28,12",
        primary_release_year: 2020,
        "vote_average.gte": 7,
      });
    });

    it("não envia parâmetros de filtro quando não informados", async () => {
      vi.mocked(tmdbClient.get).mockResolvedValueOnce({
        results: [],
        page: 1,
        total_pages: 1,
        total_results: 0,
      });

      const { result } = renderHook(() => usePopularMovies(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tmdbClient.get).toHaveBeenCalledWith("/discover/movie", {
        page: 1,
        language: "pt-BR",
        sort_by: "popularity.desc",
      });
    });
  });

  describe("useSearchMovies", () => {
    it("não busca quando a query tem 2 caracteres ou menos", () => {
      const { result } = renderHook(() => useSearchMovies("ab"), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(tmdbClient.get).not.toHaveBeenCalled();
    });

    it("busca quando a query tem mais de 2 caracteres", async () => {
      vi.mocked(tmdbClient.get).mockResolvedValueOnce({
        results: [],
        page: 1,
        total_pages: 1,
        total_results: 0,
      });

      const { result } = renderHook(() => useSearchMovies("matrix"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tmdbClient.get).toHaveBeenCalledWith("/search/movie", {
        query: "matrix",
        page: 1,
        language: "pt-BR",
        include_adult: false,
      });
    });
  });

  describe("useGenres", () => {
    it("retorna a lista de gêneros com cache permanente", async () => {
      const mockGenres = [
        { id: 28, name: "Ação" },
        { id: 35, name: "Comédia" },
      ];
      vi.mocked(tmdbClient.get).mockResolvedValueOnce({ genres: mockGenres });

      const { result } = renderHook(() => useGenres(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockGenres);
    });
  });
});
