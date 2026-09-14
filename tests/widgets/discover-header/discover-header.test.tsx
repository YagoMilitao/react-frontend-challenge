import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiscoverHeader } from "@/widgets/discover-header/discover-header";

describe("DiscoverHeader", () => {
  it("exibe o título da página", () => {
    render(<DiscoverHeader />);

    expect(screen.getByRole("heading", { name: "Descobrir filmes" })).toBeInTheDocument();
  });
});
