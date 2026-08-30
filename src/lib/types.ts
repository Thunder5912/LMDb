export interface Settings {
  omdbApiKey: string;
  preferredLanguage: string;
  region: string;
}

export interface Review {
  id: string;
  tmdbId: string;
  title: string;
  posterPath: string | null;
  rating: number; // 0 - 5 in 0.5 steps
  review: string;
  watchedDate: string; // ISO yyyy-mm-dd
  tags: string[];
  rewatch: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  addedAt: string;
}

export interface AppList {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
}

export interface AppState {
  version: number;
  settings: Settings;
  reviews: Review[];
  watchlist: WatchlistItem[];
  lists: AppList[];
}

export type MovieSummary = {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string;
};

// Shared API response contract (provider-agnostic) used across the app.
export interface TmdbMovie {
  id: string;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
}

export interface TmdbCast {
  id: string;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbCrew {
  id: string;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface TmdbCredits {
  cast: TmdbCast[];
  crew: TmdbCrew[];
}

export interface TmdbListResult {
  page: number;
  results: TmdbMovie[];
  total_results: number;
  total_pages: number;
}
