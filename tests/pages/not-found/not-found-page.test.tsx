import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { NotFoundPage } from "@/pages/not-found/not-found-page";

function renderNotFoundPage() {
  const rootRoute = createRootRoute();
  const discoverRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/discover",
    component: () => <div>Página de descoberta</div>,
  });
  const routeTree = rootRoute.addChildren([discoverRoute]);
  const router = createRouter({
    routeTree,
    defaultNotFoundComponent: NotFoundPage,
    history: createMemoryHistory({ initialEntries: ["/uma-rota-que-nao-existe"] }),
  });
  return render(<RouterProvider router={router} />);
}

describe("NotFoundPage", () => {
  it("exibe uma mensagem amigável para uma rota inexistente", async () => {
    renderNotFoundPage();

    expect(await screen.findByText("Página não encontrada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para Descobrir" })).toHaveAttribute(
      "href",
      "/discover",
    );
  });
});
