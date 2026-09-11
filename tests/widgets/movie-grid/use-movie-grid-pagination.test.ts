import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMovieGridPagination } from "@/widgets/movie-grid/use-movie-grid-pagination";

describe("useMovieGridPagination", () => {
  it("não permite voltar na primeira página", () => {
    const { result } = renderHook(() => useMovieGridPagination(1, 5));

    expect(result.current.canGoPrevious).toBe(false);
    expect(result.current.canGoNext).toBe(true);
  });

  it("permite voltar e avançar em uma página intermediária", () => {
    const { result } = renderHook(() => useMovieGridPagination(3, 5));

    expect(result.current.canGoPrevious).toBe(true);
    expect(result.current.canGoNext).toBe(true);
  });

  it("não permite avançar na última página", () => {
    const { result } = renderHook(() => useMovieGridPagination(5, 5));

    expect(result.current.canGoPrevious).toBe(true);
    expect(result.current.canGoNext).toBe(false);
  });
});
