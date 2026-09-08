import { describe, expect, it } from "vitest";
import { loginSchema } from "./login-page";

describe("loginSchema", () => {
  it("aceita e-mail válido e senha com 6+ caracteres", () => {
    const result = loginSchema.safeParse({
      email: "curador@cinedash.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({
      email: "nao-e-um-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha com menos de 6 caracteres", () => {
    const result = loginSchema.safeParse({
      email: "curador@cinedash.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});
