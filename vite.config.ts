import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Espelha em dev a serverless function de api/tmdb/[...path].ts: injeta o
 * Bearer token no servidor do Vite em vez de expô-lo no client via import.meta.env.
 */
function tmdbDevProxy(token: string) {
  const middleware: import("vite").Connect.NextHandleFunction = async (req, res) => {
    if (!token) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          status_message: "TMDB_API_READ_TOKEN não definido. Preencha o .env.",
        }),
      );
      return;
    }

    try {
      const tmdbResponse = await fetch(`${TMDB_BASE_URL}${req.url}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      });

      if (!tmdbResponse.ok) {
        console.error(`[tmdb-dev-proxy] TMDB respondeu ${tmdbResponse.status} para ${req.url}`);
      }

      res.statusCode = tmdbResponse.status;
      res.setHeader("Content-Type", "application/json");
      res.end(Buffer.from(await tmdbResponse.arrayBuffer()));
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === "TimeoutError";
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `[tmdb-dev-proxy] Falha ao contatar TMDB para ${req.url}: ${isTimeout ? "timeout" : errorMessage}`,
      );

      res.statusCode = isTimeout ? 504 : 502;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          status_message: isTimeout
            ? "Tempo de resposta do TMDB esgotado."
            : "Não foi possível contatar o TMDB.",
        }),
      );
    }
  };

  return {
    name: "tmdb-dev-proxy",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use("/api/tmdb", middleware);
    },
    configurePreviewServer(server: import("vite").PreviewServer) {
      server.middlewares.use("/api/tmdb", middleware);
    },
  };
}

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

export default defineConfig({
  plugins: [react(), tmdbDevProxy(env.TMDB_API_READ_TOKEN)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
