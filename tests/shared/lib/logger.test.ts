import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "@/shared/lib/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("error sempre loga, independente do ambiente", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("falha inesperada", { detail: 1 });

    expect(errorSpy).toHaveBeenCalledWith("falha inesperada", { detail: 1 });
  });

  it("warn loga quando DEV está ativo", () => {
    const original = import.meta.env.DEV;
    (import.meta.env as { DEV: boolean }).DEV = true;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.warn("aviso de configuração");

    expect(warnSpy).toHaveBeenCalledWith("aviso de configuração");
    (import.meta.env as { DEV: boolean }).DEV = original;
  });

  it("warn não loga fora de DEV (produção)", () => {
    const original = import.meta.env.DEV;
    (import.meta.env as { DEV: boolean }).DEV = false;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.warn("aviso de configuração");

    expect(warnSpy).not.toHaveBeenCalled();
    (import.meta.env as { DEV: boolean }).DEV = original;
  });
});
