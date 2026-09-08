import { describe, it, expect, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  it("delays function execution", async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced("test");

    expect(fn).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("test");
  });

  it("cancels previous calls when invoked again", async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced("first");
    await new Promise((resolve) => setTimeout(resolve, 30));
    debounced("second");

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("uses default delay of 300ms", async () => {
    const fn = vi.fn();
    const debounced = debounce(fn);

    debounced("test");

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fn).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(fn).toHaveBeenCalledOnce();
  });
});
