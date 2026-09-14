import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useMovieDetails,
  useMovieCredits,
  useMovieVideos,
} from "@/entities/movie/api/movie-details-query";

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

describe("movie-details-query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useMovieDetails", () => {
    it("não busca quando movieId é null", () => {
      const { result } = renderHook(() => useMovieDetails(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(tmdbClient.get).not.toHaveBeenCalled();
    });

    it("busca os detalhes do filme quando movieId é informado", async () => {
      const mockDetails = { id: 42, title: "Filme Teste", runtime: 120 };
      vi.mocked(tmdbClient.get).mockResolvedValueOnce(mockDetails);

      const { result } = renderHook(() => useMovieDetails(42), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tmdbClient.get).toHaveBeenCalledWith("/movie/42", { language: "pt-BR" });
      expect(result.current.data).toEqual(mockDetails);
    });
  });

  describe("useMovieCredits", () => {
    it("não busca quando movieId é null", () => {
      const { result } = renderHook(() => useMovieCredits(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(tmdbClient.get).not.toHaveBeenCalled();
    });

    it("busca o elenco quando movieId é informado", async () => {
      const mockCredits = { cast: [], crew: [] };
      vi.mocked(tmdbClient.get).mockResolvedValueOnce(mockCredits);

      const { result } = renderHook(() => useMovieCredits(42), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tmdbClient.get).toHaveBeenCalledWith("/movie/42/credits", { language: "pt-BR" });
    });
  });

  describe("useMovieVideos", () => {
    it("não busca quando movieId é null", () => {
      const { result } = renderHook(() => useMovieVideos(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(tmdbClient.get).not.toHaveBeenCalled();
    });

    it("busca os vídeos quando movieId é informado", async () => {
      const mockVideos = { results: [] };
      vi.mocked(tmdbClient.get).mockResolvedValueOnce(mockVideos);

      const { result } = renderHook(() => useMovieVideos(42), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tmdbClient.get).toHaveBeenCalledWith("/movie/42/videos", {
        language: "pt-BR",
        include_video_language: "pt,en,null",
      });
    });
  });
});
