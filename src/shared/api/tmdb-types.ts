/**
 * Tipos TypeScript para a API do TMDB.
 * Utilizamos tipos parciais para reduzir repetição.
 */

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  media_type?: string;
}

export interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  homepage: string | null;
  imdb_id: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Video {
  id: string;
  name: string;
  key: string; // YouTube video ID
  site: string; // "YouTube"
  type: string; // "Trailer", "Teaser", etc.
  official: boolean;
  published_at: string;
}

export interface Videos {
  results: Video[];
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TrendingResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}
