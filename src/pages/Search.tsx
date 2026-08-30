import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies, TmdbMovie } from '../lib/api';
import { useApp } from '../context/AppContext';

export default function Search() {
  const { settings } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounce = useRef<number | undefined>(undefined);

  const apiKey = settings.omdbApiKey;
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

  const showSuggestions = !!apiKey && !!language && !query;

  useEffect(() => {
    if (!showSuggestions) {
      setRecently([]);
      setUpcoming([]);
      return;
    }
    let cancelled = false;
    setSuggLoading(true);
    setSuggError('');
    const year = new Date().getFullYear();
    Promise.all([
      searchMovies(language, 1, { year }).catch(() => ({ results: [] as TmdbMovie[] })),
      searchMovies(language, 1, { year: year + 1 }).catch(() => ({ results: [] as TmdbMovie[] })),
    ])
      .then(([rec, up]) => {
        if (cancelled) return;
        setRecently(rec.results);
        setUpcoming(up.results);
      })
      .catch(() => {
        if (!cancelled) setSuggError('Could not load suggestions.');
      })
      .finally(() => {
        if (!cancelled) setSuggLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showSuggestions, language, apiKey]);

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
          {!apiKey && (
            <p className="muted">
              Add your OMDb API key in <Link to="/settings">Settings</Link> to search and get suggestions.
            </p>
          )}
          {apiKey && !language && (
            <p className="muted">
              Pick a preferred language in <Link to="/settings">Settings</Link> to see tailored suggestions.
            </p>
          )}
          {suggLoading && <p className="muted">Loading suggestions…</p>}
          {suggError && <p className="err">{suggError}</p>}

          {showSuggestions && (
            <>
              <h2>
                Recently released{region ? ` · ${region}` : ''}
                {language ? ` · ${language}` : ''}
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
                Upcoming{region ? ` · ${region}` : ''}
                {language ? ` · ${language}` : ''}
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
