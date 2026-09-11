import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/app/error-boundary";

function Bomb(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza os filhos normalmente quando não há erro", () => {
    render(
      <ErrorBoundary>
        <p>Conteúdo normal</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Conteúdo normal")).toBeInTheDocument();
  });

  it("exibe um fallback amigável quando um filho lança um erro", () => {
    // React também loga o erro no console durante o teste; silenciamos para
    // manter a saída limpa, mas o comportamento em si não muda.
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recarregar página" })).toBeInTheDocument();
  });
});
