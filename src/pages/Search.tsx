import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies, fetchHomeSuggestions, TmdbMovie } from '../lib/api';
import { useApp } from '../context/AppContext';
import { LANGUAGES, REGIONS } from './Settings';

const HOME_CACHE_KEY = 'lmdb-home-suggestions';
const ONE_DAY = 24 * 60 * 60 * 1000;

interface CachedHome {
  key: string;
  ts: number;
  recently: TmdbMovie[];
  upcoming: TmdbMovie[];
}

function loadHomeCache(lang: string, region: string): CachedHome | null {
  try {
    const raw = localStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CachedHome;
    if (c.key === `${lang}|${region}` && Date.now() - c.ts < ONE_DAY) return c;
  } catch {
    /* ignore */
  }
  return null;
}

function saveHomeCache(lang: string, region: string, recently: TmdbMovie[], upcoming: TmdbMovie[]) {
  try {
    localStorage.setItem(
      HOME_CACHE_KEY,
      JSON.stringify({ key: `${lang}|${region}`, ts: Date.now(), recently, upcoming })
    );
  } catch {
    /* ignore */
  }
}

const langLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.label || code;
const regionLabel = (code: string) => REGIONS.find((r) => r.code === code)?.label || code;

export default function Search() {
  const { settings } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounce = useRef<number | undefined>(undefined);

  const apiKey = settings.omdbApiKey;
  const tmdbKey = settings.tmdbApiKey;
  const language = settings.preferredLanguage;
  const region = settings.region;

  const [recently, setRecently] = useState<TmdbMovie[]>([]);
  const [upcoming, setUpcoming] = useState<TmdbMovie[]>([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggError, setSuggError] = useState('');

  function onSearch(value: string) {
    setQuery(value);
    window.clearTimeout(debounce.current);
    if (!value.trim()) {
      setResults([]);
      setError('');
      return;
    }
    if (!apiKey) {
      setError('Set your OMDb API key in Settings first.');
      return;
    }
    debounce.current = window.setTimeout(() => {
      setLoading(true);
      setError('');
      searchMovies(value.trim())
        .then((res) => setResults(res.results))
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }, 400);
  }

  useEffect(() => () => window.clearTimeout(debounce.current), []);

  const showSuggestions = !!tmdbKey && !!language && !query;

  useEffect(() => {
    if (!showSuggestions) {
      setRecently([]);
      setUpcoming([]);
      return;
    }
    const cached = loadHomeCache(language, region);
    if (cached) {
      setRecently(cached.recently);
      setUpcoming(cached.upcoming);
      setSuggLoading(false);
      setSuggError('');
      return;
    }
    let cancelled = false;
    setSuggLoading(true);
    setSuggError('');
    fetchHomeSuggestions(language, region)
      .then((data) => {
        if (cancelled) return;
        setRecently(data.recently);
        setUpcoming(data.upcoming);
        saveHomeCache(language, region, data.recently, data.upcoming);
      })
      .catch((e: Error) => {
        if (!cancelled) setSuggError(e.message);
      })
      .finally(() => {
        if (!cancelled) setSuggLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showSuggestions, language, region, tmdbKey]);

  return (
    <div className="page">
      <h1>Search films</h1>
      <input
        className="search-input"
        placeholder="Search OMDb for a movie…"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
      />

      {error && <p className="err">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!query && (
        <section className="suggestions">
          {!tmdbKey && (
            <p className="muted">
              Add your TMDB API key in <Link to="/settings">Settings</Link> to see tailored suggestions.
            </p>
          )}
          {tmdbKey && !language && (
            <p className="muted">
              Pick a preferred language in <Link to="/settings">Settings</Link> to see tailored suggestions.
            </p>
          )}
          {suggLoading && <p className="muted">Loading suggestions…</p>}
          {suggError && <p className="err">{suggError}</p>}

          {showSuggestions && (
            <>
              <h2>
                Recently released{region ? ` · ${regionLabel(region)}` : ''}
                {language ? ` · ${langLabel(language)}` : ''}
              </h2>
              <div className="grid">
                {recently.map((m) => (
                  <MovieCard
                    key={m.id}
                    id={m.id}
                    title={m.title}
                    posterPath={m.poster_path}
                    releaseDate={m.release_date}
                    rating={m.vote_average ? Math.round((m.vote_average / 2) * 10) / 10 : undefined}
                    subtitle={m.release_date?.slice(0, 4) || ''}
                  />
                ))}
              </div>
              {recently.length === 0 && !suggLoading && (
                <p className="muted">No recently released titles found for this language.</p>
              )}

              <h2>
                Upcoming{region ? ` · ${regionLabel(region)}` : ''}
                {language ? ` · ${langLabel(language)}` : ''}
              </h2>
              <div className="grid">
                {upcoming.map((m) => (
                  <MovieCard
                    key={m.id}
                    id={m.id}
                    title={m.title}
                    posterPath={m.poster_path}
                    releaseDate={m.release_date}
                    rating={m.vote_average ? Math.round((m.vote_average / 2) * 10) / 10 : undefined}
                    subtitle={m.release_date?.slice(0, 4) || ''}
                  />
                ))}
              </div>
              {upcoming.length === 0 && !suggLoading && (
                <p className="muted">No upcoming titles found for this language yet.</p>
              )}
              {!suggLoading && (recently.length > 0 || upcoming.length > 0) && (
                <p className="muted">Suggestions refresh once every 24 hours.</p>
              )}
            </>
          )}
        </section>
      )}

      <div className="grid">
        {results.map((m) => (
          <MovieCard
            key={m.id}
            id={m.id}
            title={m.title}
            posterPath={m.poster_path}
            releaseDate={m.release_date}
            rating={m.vote_average ? Math.round((m.vote_average / 2) * 10) / 10 : undefined}
            subtitle={
              apiKey && m.vote_average
                ? `${m.release_date?.slice(0, 4) || ''} · OMDb ${m.vote_average.toFixed(1)}`
                : m.release_date?.slice(0, 4)
            }
          />
        ))}
      </div>

      {!loading && !error && results.length === 0 && query && (
        <p className="muted">No results for “{query}”.</p>
      )}
    </div>
  );
}
