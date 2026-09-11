import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { LoginPage } from "@/pages/login/login-page";
import { useAuthStore } from "@/features/auth/model/auth-store";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

function renderLoginPage() {
  const rootRoute = createRootRoute();
  const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
  const discoverRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/discover",
    component: () => <div>Página de descoberta</div>,
  });
  const routeTree = rootRoute.addChildren([loginRoute, discoverRoute]);
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ["/login"] }) });
  return render(<RouterProvider router={router} />);
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: null, user: null });
  });

  it("mostra erros de validação para dados inválidos", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText("E-mail"), "nao-e-email");
    await user.type(screen.getByLabelText("Senha"), "123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe um e-mail válido")).toBeInTheDocument();
    expect(screen.getByText("A senha deve ter no mínimo 6 caracteres")).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("loga, exibe toast de sucesso e navega para /discover com dados válidos", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText("E-mail"), "curador@cinedash.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Página de descoberta")).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(toast.success).toHaveBeenCalledWith(
      "Login realizado com sucesso!",
      expect.objectContaining({ description: "curador@cinedash.com" }),
    );
  });
});
