import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { AppNav } from "@/widgets/app-nav";
import { LoginPage } from "@/pages/login/login-page";
import { DiscoverPage } from "@/pages/discover/discover-page";
import { WatchlistPage } from "@/pages/watchlist/watchlist-page";
import { MovieDetailsPage } from "@/pages/movie-details/movie-details-page";

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

/**
 * Layout das rotas protegidas: aplica a guarda de autenticação uma única vez
 * e renderiza a navegação (Descobrir / Minha lista / tema / logout) ao redor
 * de todas as páginas internas.
 */
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-layout",
  beforeLoad: requireAuth,
  component: () => (
    <div className="min-h-screen bg-background">
      <AppNav />
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: DiscoverPage,
});

const discoverRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/discover",
  component: DiscoverPage,
});

const watchlistRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/watchlist",
  component: WatchlistPage,
});

const movieDetailsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/movie/$id",
  component: MovieDetailsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([indexRoute, discoverRoute, watchlistRoute, movieDetailsRoute]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
