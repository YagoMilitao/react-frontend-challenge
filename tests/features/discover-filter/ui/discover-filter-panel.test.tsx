import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { DiscoverFilterPanel } from "@/features/discover-filter/ui/discover-filter-panel";
import { useDiscoverFilterStore } from "@/features/discover-filter/model/discover-filter-store";

vi.mock("@/shared/api/http-client", () => ({
  tmdbClient: {
    get: vi.fn().mockResolvedValue({
      genres: [
        { id: 28, name: "Ação" },
        { id: 35, name: "Comédia" },
      ],
    }),
  },
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("DiscoverFilterPanel", () => {
  beforeEach(() => {
    useDiscoverFilterStore.getState().reset();
  });

  it("lista os gêneros retornados pela API", async () => {
    renderWithQueryClient(<DiscoverFilterPanel />);

    expect(await screen.findByLabelText("Ação")).toBeInTheDocument();
    expect(screen.getByLabelText("Comédia")).toBeInTheDocument();
  });

  it("marca um gênero no store ao clicar no checkbox", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<DiscoverFilterPanel />);

    const checkbox = await screen.findByLabelText("Ação");
    await user.click(checkbox);

    expect(useDiscoverFilterStore.getState().selectedGenres).toEqual([28]);
  });

  it("desabilita o botão de limpar quando não há filtros ativos", async () => {
    renderWithQueryClient(<DiscoverFilterPanel />);

    await screen.findByLabelText("Ação");
    expect(screen.getByRole("button", { name: "Limpar" })).toBeDisabled();
  });

  it("habilita o botão de limpar e reseta os filtros ao clicar", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<DiscoverFilterPanel />);

    const checkbox = await screen.findByLabelText("Ação");
    await user.click(checkbox);

    const clearButton = screen.getByRole("button", { name: "Limpar" });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);

    expect(useDiscoverFilterStore.getState().selectedGenres).toEqual([]);
  });
});
