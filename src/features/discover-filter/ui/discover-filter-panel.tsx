import { useGenres } from "@/entities/movie";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { useDiscoverFilterStore } from "../model/discover-filter-store";

const CURRENT_YEAR = new Date().getFullYear();
const OLDEST_YEAR = 1950;
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - OLDEST_YEAR + 1 },
  (_, index) => CURRENT_YEAR - index,
);
const MIN_RATING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function DiscoverFilterPanel() {
  const { data: genres, isLoading: isLoadingGenres } = useGenres();
  const selectedGenres = useDiscoverFilterStore((state) => state.selectedGenres);
  const year = useDiscoverFilterStore((state) => state.year);
  const minRating = useDiscoverFilterStore((state) => state.minRating);
  const toggleGenre = useDiscoverFilterStore((state) => state.toggleGenre);
  const setYear = useDiscoverFilterStore((state) => state.setYear);
  const setMinRating = useDiscoverFilterStore((state) => state.setMinRating);
  const reset = useDiscoverFilterStore((state) => state.reset);

  const hasActiveFilters = selectedGenres.length > 0 || year !== undefined || minRating !== undefined;

  return (
    <div className="flex flex-col gap-6 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtros</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={!hasActiveFilters}
        >
          Limpar
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Gênero</Label>
        {isLoadingGenres ? (
          <p className="text-sm text-muted-foreground">Carregando gêneros...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {genres?.map((genre) => (
              <div key={genre.id} className="flex items-center gap-2">
                <Checkbox
                  id={`genre-${genre.id}`}
                  checked={selectedGenres.includes(genre.id)}
                  onCheckedChange={(checked) => toggleGenre(genre.id, checked === true)}
                />
                <Label htmlFor={`genre-${genre.id}`} className="font-normal">
                  {genre.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="year-filter">Ano de lançamento</Label>
        <Select
          value={year ? String(year) : "all"}
          onValueChange={(value) => setYear(value === "all" ? undefined : Number(value))}
        >
          <SelectTrigger id="year-filter">
            <SelectValue placeholder="Todos os anos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            {YEAR_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="rating-filter">Nota mínima</Label>
        <Select
          value={minRating ? String(minRating) : "all"}
          onValueChange={(value) => setMinRating(value === "all" ? undefined : Number(value))}
        >
          <SelectTrigger id="rating-filter">
            <SelectValue placeholder="Qualquer nota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer nota</SelectItem>
            {MIN_RATING_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
