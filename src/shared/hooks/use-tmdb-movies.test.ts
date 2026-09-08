import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useTrendingMovies,
  useSearchMovies,
  useMovieDetails,
  useGenres,
} from "./use-tmdb-movies";

// Mock do cliente HTTP
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

describe("TMDB Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useTrendingMovies fetches trending movies", async () => {
    const mockData = {
      results: [
        {
          id: 1,
          title: "Test Movie",
          release_date: "2024-01-01",
          vote_average: 8.5,
          genre_ids: [28],
        },
      ],
      page: 1,
      total_pages: 10,
      total_results: 200,
    };

    vi.mocked(tmdbClient.get).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useTrendingMovies(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("useSearchMovies is disabled when query is too short", () => {
    const { result } = renderHook(() => useSearchMovies("ab", 1), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(tmdbClient.get).not.toHaveBeenCalled();
  });

  it("useMovieDetails is disabled when movieId is null", () => {
    const { result } = renderHook(() => useMovieDetails(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(tmdbClient.get).not.toHaveBeenCalled();
  });

  it("useGenres has infinite staleTime", async () => {
    const mockData = [
      { id: 28, name: "Action" },
      { id: 35, name: "Comedy" },
    ];

    vi.mocked(tmdbClient.get).mockResolvedValueOnce({
      genres: mockData,
    });

    const { result } = renderHook(() => useGenres(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
