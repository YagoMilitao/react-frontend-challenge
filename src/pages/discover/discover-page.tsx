import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTrendingMovies, usePopularMovies, useSearchMovies } from "@/entities/movie";
import type { Movie } from "@/entities/movie";
import { DiscoverFilterPanel, useDiscoverFilterStore } from "@/features/discover-filter";
import { SearchInput } from "@/features/search-movies";
import { DiscoverHeader } from "@/widgets/discover-header";
import { MovieGrid } from "@/widgets/movie-grid";

const MIN_SEARCH_LENGTH = 3;

export function DiscoverPage() {
  const navigate = useNavigate();
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

  // Reseta a página ao trocar filtro ou busca durante a renderização, antes que os
  // hooks de query abaixo disparem uma requisição com a página antiga.
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [prevFilters, setPrevFilters] = useState(filters);
  let currentPage = page;
  if (searchQuery !== prevSearchQuery || filters !== prevFilters) {
    setPrevSearchQuery(searchQuery);
    setPrevFilters(filters);
    currentPage = 1;
    setPage(1);
  }

  const trendingQuery = useTrendingMovies(currentPage, !isSearching && !hasFilters);
  const popularQuery = usePopularMovies(currentPage, filters, !isSearching && hasFilters);
  const searchResultsQuery = useSearchMovies(searchQuery, filters, currentPage);

  let activeQuery = trendingQuery;
  if (isSearching) {
    activeQuery = searchResultsQuery;
  } else if (hasFilters) {
    activeQuery = popularQuery;
  }

  useEffect(() => {
    if (activeQuery.isError) {
      toast.error("Não foi possível carregar os filmes.", {
        description: "Verifique sua conexão e tente novamente.",
      });
    }
  }, [activeQuery.isError]);

  function handleMovieClick(movie: Movie) {
    navigate({ to: "/movie/$id", params: { id: String(movie.id) } });
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
            isError={activeQuery.isError}
            isFetching={activeQuery.isFetching}
            page={currentPage}
            totalPages={activeQuery.data?.total_pages}
            onPageChange={setPage}
            onMovieClick={handleMovieClick}
          />
        </div>
      </div>
    </div>
  );
}
