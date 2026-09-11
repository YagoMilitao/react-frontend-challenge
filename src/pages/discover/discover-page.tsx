import { useEffect, useMemo, useState } from "react";
import { useTrendingMovies, usePopularMovies, useSearchMovies } from "@/entities/movie";
import { DiscoverFilterPanel, useDiscoverFilterStore } from "@/features/discover-filter";
import { SearchInput } from "@/features/search-movies";
import { DiscoverHeader } from "@/widgets/discover-header";
import { MovieGrid } from "@/widgets/movie-grid";

const MIN_SEARCH_LENGTH = 3;

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const selectedGenres = useDiscoverFilterStore((state) => state.selectedGenres);
  const year = useDiscoverFilterStore((state) => state.year);
  const minRating = useDiscoverFilterStore((state) => state.minRating);

  const filters = useMemo(
    () => ({ selectedGenres, year, minRating }),
    [selectedGenres, year, minRating],
  );

  const isSearching = searchQuery.trim().length >= MIN_SEARCH_LENGTH;
  const hasFilters = selectedGenres.length > 0 || year !== undefined || minRating !== undefined;

  // Reseta a página ao trocar filtro ou busca — resultados de uma consulta diferente
  // não fazem sentido continuar na mesma página da consulta anterior.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedGenres, year, minRating]);

  const trendingQuery = useTrendingMovies(page, !isSearching && !hasFilters);
  const popularQuery = usePopularMovies(page, filters, !isSearching && hasFilters);
  const searchResultsQuery = useSearchMovies(searchQuery, filters, page);

  let activeQuery = trendingQuery;
  if (isSearching) {
    activeQuery = searchResultsQuery;
  } else if (hasFilters) {
    activeQuery = popularQuery;
  }

  return (
    <div className="container flex flex-col gap-6 py-8">
      <DiscoverHeader />

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <DiscoverFilterPanel />

        <div className="flex flex-col gap-6">
          <SearchInput onSearch={setSearchQuery} />

          <MovieGrid
            movies={activeQuery.data?.results ?? []}
            isLoading={activeQuery.isLoading}
            page={page}
            totalPages={activeQuery.data?.total_pages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
