import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMovieGridPagination } from "@/widgets/movie-grid/use-movie-grid-pagination";

describe("useMovieGridPagination", () => {
  it("começa na página 1", () => {
    const { result } = renderHook(() => useMovieGridPagination(5));

    expect(result.current.page).toBe(1);
    expect(result.current.canGoPrevious).toBe(false);
    expect(result.current.canGoNext).toBe(true);
  });

  it("avança para a próxima página e chama onPageChange", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() => useMovieGridPagination(5, onPageChange));

    act(() => result.current.goToNextPage());

    expect(result.current.page).toBe(2);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("volta para a página anterior e chama onPageChange", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() => useMovieGridPagination(5, onPageChange));

    act(() => result.current.goToNextPage());
    act(() => result.current.goToPreviousPage());

    expect(result.current.page).toBe(1);
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it("não avança além da última página", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() => useMovieGridPagination(1, onPageChange));

    act(() => result.current.goToNextPage());

    expect(result.current.page).toBe(1);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("não volta antes da primeira página", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() => useMovieGridPagination(5, onPageChange));

    act(() => result.current.goToPreviousPage());

    expect(result.current.page).toBe(1);
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
