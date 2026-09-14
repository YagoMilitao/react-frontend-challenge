import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "../../api/tmdb";

function buildRequest(path: string, { method = "GET" }: { method?: string } = {}) {
  return new Request(`https://cinedash.test/api/tmdb?path=${encodeURIComponent(path)}`, {
    method,
  });
}

describe("api/tmdb proxy", () => {
  const originalToken = process.env.TMDB_API_READ_TOKEN;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.TMDB_API_READ_TOKEN = "secret-token";
  });

  afterEach(() => {
    process.env.TMDB_API_READ_TOKEN = originalToken;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("rejeita métodos diferentes de GET", async () => {
    const response = await handler(buildRequest("discover/movie", { method: "POST" }));

    expect(response.status).toBe(405);
  });

  it("retorna 500 sem vazar o token quando TMDB_API_READ_TOKEN não está configurado", async () => {
    delete process.env.TMDB_API_READ_TOKEN;

    const response = await handler(buildRequest("discover/movie"));
    const body = (await response.json()) as { status_message: string };

    expect(response.status).toBe(500);
    expect(body.status_message).not.toContain("secret-token");
  });

  it("rejeita rotas fora da allowlist", async () => {
    const response = await handler(buildRequest("account"));

    expect(response.status).toBe(404);
  });

  it("repassa o status da TMDB e loga quando a resposta não é 2xx", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status_message: "Invalid API key" }), { status: 401 }),
      );

    const response = await handler(buildRequest("discover/movie"));

    expect(response.status).toBe(401);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("nunca inclui o token na URL repassada à TMDB", async () => {
    let capturedUrl = "";
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url;
      return Promise.resolve(new Response("{}", { status: 200 }));
    });

    await handler(buildRequest("discover/movie"));

    expect(capturedUrl).not.toContain("secret-token");
  });

  it("retorna 502 e loga quando a chamada à TMDB falha por erro de rede", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const response = await handler(buildRequest("discover/movie"));
    const body = (await response.json()) as { status_message: string };

    expect(response.status).toBe(502);
    expect(body.status_message).toMatch(/não foi possível contatar/i);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("retorna 504 quando a chamada à TMDB estoura o timeout", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const timeoutError = new Error("The operation timed out");
    timeoutError.name = "TimeoutError";
    global.fetch = vi.fn().mockRejectedValue(timeoutError);

    const response = await handler(buildRequest("discover/movie"));
    const body = (await response.json()) as { status_message: string };

    expect(response.status).toBe(504);
    expect(body.status_message).toMatch(/tempo de resposta/i);
  });
});
