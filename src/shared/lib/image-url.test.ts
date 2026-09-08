import { describe, it, expect, vi } from "vitest";
import { getImageUrl, getYouTubeUrl } from "./image-url";

// Mock env
vi.mock("@/shared/config/env", () => ({
  env: {
    tmdbImageBaseUrl: "https://image.tmdb.org/t/p",
  },
}));

describe("image-url utils", () => {
  it("constructs image URL with default size", () => {
    const url = getImageUrl("/kXfqcdQKsToO0OUXHcrrKcHMX4.jpg");
    expect(url).toBe(
      "https://image.tmdb.org/t/p/w500/kXfqcdQKsToO0OUXHcrrKcHMX4.jpg",
    );
  });

  it("constructs image URL with custom size", () => {
    const url = getImageUrl("/kXfqcdQKsToO0OUXHcrrKcHMX4.jpg", "original");
    expect(url).toBe(
      "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrKcHMX4.jpg",
    );
  });

  it("returns placeholder when path is null", () => {
    const url = getImageUrl(null);
    expect(url).toBe("/placeholder-movie.svg");
  });

  it("constructs YouTube URL from video key", () => {
    const url = getYouTubeUrl("dQw4w9WgXcQ");
    expect(url).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });
});
