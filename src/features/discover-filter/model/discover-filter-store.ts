import { create } from "zustand";

interface DiscoverFilterState {
  selectedGenres: number[];
  year: number | undefined;
  minRating: number | undefined;
  toggleGenre: (genreId: number, selected: boolean) => void;
  setYear: (year: number | undefined) => void;
  setMinRating: (rating: number | undefined) => void;
  reset: () => void;
}

const initialState = {
  selectedGenres: [] as number[],
  year: undefined as number | undefined,
  minRating: undefined as number | undefined,
};

/**
 * Estado dos filtros de descoberta. Sem persist propositalmente:
 * o curador começa cada sessão de exploração com os filtros zerados.
 */
export const useDiscoverFilterStore = create<DiscoverFilterState>()((set) => ({
  ...initialState,
  toggleGenre: (genreId, selected) =>
    set((state) => ({
      selectedGenres: selected
        ? [...state.selectedGenres, genreId]
        : state.selectedGenres.filter((id) => id !== genreId),
    })),
  setYear: (year) => set({ year }),
  setMinRating: (minRating) => set({ minRating }),
  reset: () => set(initialState),
}));
