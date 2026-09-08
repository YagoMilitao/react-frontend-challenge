import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { LoginPage } from "@/pages/login/login-page";
import { DiscoverPage } from "@/pages/discover/discover-page";

/**
 * Guarda de rota: como a autenticação é simulada em client-side (sem backend),
 * a checagem acontece no `beforeLoad` de cada rota protegida, lendo o Zustand
 * store diretamente (fora de componente React) e redirecionando para /login
 * quando não há sessão válida.
 */
function requireAuth() {
  if (!useAuthStore.getState().isAuthenticated()) {
    throw redirect({ to: "/login" });
  }
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: requireAuth,
  component: DiscoverPage,
});

const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discover",
  beforeLoad: requireAuth,
  component: DiscoverPage,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, discoverRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
