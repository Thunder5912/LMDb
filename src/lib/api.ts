import { TmdbMovie, TmdbCredits, TmdbListResult } from './types';
import { loadState } from './storage';

export type { TmdbMovie, TmdbListResult, TmdbCredits } from './types';

// In dev we route OMDb + poster images through the Vite server (see vite.config.ts).
// In production (and `vite preview`) we route through /api/* serverless functions
// (see /api and vercel.json) so the browser never hits OMDb directly (avoids CORS
// and lets html2canvas capture posters for sharing).
const isDev = import.meta.env.DEV;
const BASE = isDev ? '/omdb' : '/api/omdb';
const TMDB_BASE = isDev ? '/tmdb' : '/api/tmdb';
const IMG_PROXY = isDev ? '/img?u=' : '/api/img?u=';

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'timeout' | 'network'; detail?: string };

function getKey(): string {
  const key = loadState().settings.omdbApiKey;
  if (!key) throw new Error('OMDb API key is not set. Add it in Settings.');
  return key;
}

function toIsoDate(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const m = value.match(/(\d{4})/);
  return m ? `${m[1]}-01-01` : '';
}

function mapSearchItem(item: any): TmdbMovie {
  return {
    id: String(item.imdbID),
    title: item.Title || 'Unknown',
    original_title: item.Title || 'Unknown',
    overview: '',
    poster_path: item.Poster && item.Poster !== 'N/A' ? item.Poster : null,
    backdrop_path: null,
    release_date: item.Year ? `${item.Year}-01-01` : '',
    vote_average: 0,
    genre_ids: [],
    genres: [],
  };
}

function mapDetail(item: any): TmdbMovie & { _credits?: TmdbCredits } {
  const genres = String(item.Genre || '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: i, name }));
  const cast = String(item.Actors || '')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: `c${i}`, name, character: 'Actor', profile_path: null }));
  const crew: TmdbCredits['crew'] = [];
  String(item.Director || '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)
    .forEach((name, i) => crew.push({ id: `d${i}`, name, job: 'Director', profile_path: null }));
  String(item.Writer || '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean)
    .forEach((name, i) => crew.push({ id: `w${i}`, name, job: 'Writer', profile_path: null }));

  return {
    id: String(item.imdbID),
    title: item.Title || 'Unknown',
    original_title: item.Title || 'Unknown',
    overview: item.Plot || '',
    poster_path: item.Poster && item.Poster !== 'N/A' ? item.Poster : null,
    backdrop_path: null,
    release_date: toIsoDate(item.Released),
    vote_average: parseFloat(item.imdbRating) || 0,
    genre_ids: [],
    genres,
    runtime: parseInt(String(item.Runtime).replace(/\D/g, ''), 10) || undefined,
    tagline: '',
    _credits: { cast, crew },
  };
}

function proxied(path: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) {
    return IMG_PROXY ? `${IMG_PROXY}${encodeURIComponent(path)}` : path;
  }
  return path;
}

export async function searchMovies(
  query: string,
  page = 1,
  opts?: { year?: string | number }
): Promise<TmdbListResult> {
  const key = getKey();
  const url = new URL(BASE, window.location.origin);
  url.searchParams.set('apikey', key);
  url.searchParams.set('s', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('type', 'movie');
  if (opts?.year) url.searchParams.set('y', String(opts.year));
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.Response !== 'True') {
    throw new Error(data.Error || 'OMDb request failed.');
  }
  const results = (data.Search || []).map(mapSearchItem);
  const total = parseInt(data.totalResults, 10) || results.length;
  return {
    page,
    results,
    total_results: total,
    total_pages: Math.max(1, Math.ceil(total / 10)),
  };
}

export async function getMovie(id: string): Promise<TmdbMovie> {
  const key = getKey();
  const url = new URL(BASE, window.location.origin);
  url.searchParams.set('apikey', key);
  url.searchParams.set('i', id);
  url.searchParams.set('plot', 'full');
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.Response !== 'True') {
    throw new Error(data.Error || 'OMDb request failed.');
  }
  return mapDetail(data);
}

export async function getCredits(id: string): Promise<TmdbCredits> {
  const movie = (await getMovie(id)) as TmdbMovie & { _credits?: TmdbCredits };
  return movie._credits || { cast: [], crew: [] };
}

export interface HomeSuggestions {
  recently: TmdbMovie[];
  upcoming: TmdbMovie[];
}

function mapTmdbMovie(item: any): TmdbMovie {
  return {
    id: String(item.id),
    title: item.title || item.original_title || 'Unknown',
    original_title: item.original_title || item.title || '',
    overview: item.overview || '',
    poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    backdrop_path: null,
    release_date: item.release_date || '',
    vote_average: item.vote_average || 0,
    genre_ids: item.genre_ids || [],
    genres: [],
  };
}

export async function fetchHomeSuggestions(
  languageCode: string,
  regionCode: string
): Promise<HomeSuggestions> {
  const key = loadState().settings.tmdbApiKey;
  if (!key) throw new Error('Add a TMDB API key in Settings to load suggestions.');

  const today = new Date().toISOString().slice(0, 10);

  const buildUrl = (params: Record<string, string>) => {
    const url = new URL(TMDB_BASE, window.location.origin);
    url.searchParams.set('api_key', key);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  };

  const recentlyUrl = buildUrl({
    sort_by: 'primary_release_date.desc',
    'primary_release_date.lte': today,
    with_original_language: languageCode,
    ...(regionCode ? { region: regionCode } : {}),
    page: '1',
  });

  const upcomingUrl = buildUrl({
    sort_by: 'primary_release_date.asc',
    'primary_release_date.gte': today,
    with_original_language: languageCode,
    ...(regionCode ? { region: regionCode } : {}),
    page: '1',
  });

  const [recentlyRes, upcomingRes] = await Promise.all([
    fetch(recentlyUrl),
    fetch(upcomingUrl),
  ]);
  const recentlyData = await recentlyRes.json();
  const upcomingData = await upcomingRes.json();

  if (recentlyData.success === false) {
    throw new Error(recentlyData.status_message || 'TMDB request failed.');
  }
  if (upcomingData.success === false) {
    throw new Error(upcomingData.status_message || 'TMDB request failed.');
  }

  return {
    recently: (recentlyData.results || []).map(mapTmdbMovie),
    upcoming: (upcomingData.results || []).map(mapTmdbMovie),
  };
}

export function posterUrl(path: string | null, _size: 'w200' | 'w300' | 'w500' | 'original' = 'w500'): string {
  return proxied(path);
}

export function profileUrl(path: string | null, _size: 'w185' | 'original' = 'w185'): string {
  return proxied(path);
}

export async function validateKey(key: string): Promise<ValidationResult> {
  if (!key) return { ok: false, reason: 'invalid' };
  const url = new URL(BASE, window.location.origin);
  url.searchParams.set('apikey', key);
  url.searchParams.set('i', 'tt0111161');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    if (data.Response === 'True') return { ok: true };
    if (data.Error && /invalid|incorrect/i.test(data.Error)) return { ok: false, reason: 'invalid' };
    if (!res.ok) return { ok: false, reason: 'network', detail: `HTTP ${res.status}` };
    return { ok: false, reason: 'invalid' };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, reason: 'timeout', detail };
    }
    return { ok: false, reason: 'network', detail };
  } finally {
    clearTimeout(timeout);
  }
}
