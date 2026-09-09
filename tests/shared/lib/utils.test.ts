import { describe, expect, it } from "vitest";
import { cn } from "@/shared/lib/utils";

describe("cn", () => {
  it("concatena classes simples", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("resolve conflitos do tailwind mantendo a última classe", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
