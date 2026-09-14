import { describe, it, expect, beforeEach } from "vitest";
import { useDiscoverFilterStore } from "@/features/discover-filter/model/discover-filter-store";

function resetStore() {
  useDiscoverFilterStore.getState().reset();
}

describe("discover-filter-store", () => {
  beforeEach(() => {
    resetStore();
  });

  it("começa sem nenhum filtro aplicado", () => {
    const state = useDiscoverFilterStore.getState();

    expect(state.selectedGenres).toEqual([]);
    expect(state.year).toBeUndefined();
    expect(state.minRating).toBeUndefined();
  });

  it("adiciona um gênero selecionado", () => {
    useDiscoverFilterStore.getState().toggleGenre(28, true);

    expect(useDiscoverFilterStore.getState().selectedGenres).toEqual([28]);
  });

  it("remove um gênero quando desmarcado", () => {
    useDiscoverFilterStore.getState().toggleGenre(28, true);
    useDiscoverFilterStore.getState().toggleGenre(12, true);
    useDiscoverFilterStore.getState().toggleGenre(28, false);

    expect(useDiscoverFilterStore.getState().selectedGenres).toEqual([12]);
  });

  it("define o ano de lançamento", () => {
    useDiscoverFilterStore.getState().setYear(2020);

    expect(useDiscoverFilterStore.getState().year).toBe(2020);
  });

  it("define a nota mínima", () => {
    useDiscoverFilterStore.getState().setMinRating(7);

    expect(useDiscoverFilterStore.getState().minRating).toBe(7);
  });

  it("reseta todos os filtros", () => {
    const store = useDiscoverFilterStore.getState();
    store.toggleGenre(28, true);
    store.setYear(2020);
    store.setMinRating(7);

    store.reset();

    const state = useDiscoverFilterStore.getState();
    expect(state.selectedGenres).toEqual([]);
    expect(state.year).toBeUndefined();
    expect(state.minRating).toBeUndefined();
  });
});
