import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "@/features/search-movies/ui/search-input";

describe("SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("não chama onSearch imediatamente ao digitar", () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "matrix" } });

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("chama onSearch com o valor final após o delay", () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} delayMs={300} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "matrix" } });
    vi.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith("matrix");
  });

  it("cancela chamadas pendentes quando o usuário continua digitando", () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} delayMs={300} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "mat" } });
    vi.advanceTimersByTime(200);
    fireEvent.change(input, { target: { value: "matrix" } });
    vi.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith("matrix");
  });

  it("atualiza o valor exibido imediatamente, mesmo antes do debounce disparar", () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByRole("searchbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "matrix" } });

    expect(input.value).toBe("matrix");
    expect(onSearch).not.toHaveBeenCalled();
  });
});
