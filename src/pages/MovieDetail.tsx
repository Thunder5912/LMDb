import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCredits, getMovie, posterUrl, profileUrl, TmdbCredits, TmdbMovie } from '../lib/api';
import { useApp } from '../context/AppContext';
import RatingStars from '../components/RatingStars';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist, getReviewForMovie, lists, addToList } = useApp();
  const [movie, setMovie] = useState<TmdbMovie | null>(null);
  const [credits, setCredits] = useState<TmdbCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listMenu, setListMenu] = useState(false);

  const tmdbId = id ?? '';
  const inWatchlist = isInWatchlist(tmdbId);
  const existing = getReviewForMovie(tmdbId);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([getMovie(tmdbId), getCredits(tmdbId)])
      .then(([m, c]) => {
        if (cancelled) return;
        setMovie(m);
        setCredits(c);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="page"><p className="err">{error}</p></div>;
  if (!movie) return null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const director = credits?.crew.find((c) => c.job === 'Director')?.name;

  return (
    <div className="page detail">
      <button className="btn small ghost" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-top">
        <img className="detail-poster" src={posterUrl(movie.poster_path, 'w500')} alt={movie.title} crossOrigin="anonymous" />
        <div className="detail-info">
          <h1>{movie.title}</h1>
          <p className="muted">{year} · {movie.genres?.map((g) => g.name).join(', ') || 'Film'}</p>
          {director && <p className="muted">Director: {director}</p>}
          {movie.tagline && <p className="tagline">“{movie.tagline}”</p>}
          <p className="overview">{movie.overview}</p>

          <div className="detail-actions">
            <Link to={`/log/${tmdbId}`} className="btn primary">
              {existing ? 'Edit review' : 'Log / review'}
            </Link>
            <button className={'btn' + (inWatchlist ? ' danger' : '')} onClick={() => toggleWatchlist({
              id: movie.id, title: movie.title, posterPath: movie.poster_path, releaseDate: movie.release_date,
            })}>
              {inWatchlist ? '✓ In watchlist' : '+ Watchlist'}
            </button>
            <div className="list-dropdown">
              <button className="btn" onClick={() => setListMenu((v) => !v)}>+ List</button>
              {listMenu && (
                <div className="dropdown-menu">
                  {lists.length === 0 && <span className="muted">No lists yet</span>}
                  {lists.map((l) => (
                    <button
                      key={l.id}
                      className="dropdown-item"
                      onClick={() => {
                        addToList(l.id, { id: movie.id, title: movie.title, posterPath: movie.poster_path, releaseDate: movie.release_date });
                        setListMenu(false);
                      }}
                    >
                      {l.name}
                    </button>
                  ))}
                  <Link to="/lists" className="dropdown-item" onClick={() => setListMenu(false)}>
                    Manage lists →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {credits && credits.cast.length > 0 && (
        <section className="cast">
          <h2>Cast</h2>
          <div className="cast-row">
            {credits.cast.slice(0, 12).map((c) => (
              <div key={c.id} className="cast-item">
                {c.profile_path ? (
                  <img src={profileUrl(c.profile_path)} alt={c.name} loading="lazy" />
                ) : (
                  <div className="cast-fallback">{c.name.slice(0, 1)}</div>
                )}
                <div className="cast-name">{c.name}</div>
                <div className="cast-char">{c.character}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {existing && (
        <section className="existing-review">
          <h2>Your review</h2>
          <div className="review-head">
            <div className="review-rating"><RatingStars value={existing.rating} readOnly size={20} /></div>
            <span className="muted">{existing.watchedDate}</span>
          </div>
          {existing.review && <p className="review-text">{existing.review}</p>}
        </section>
      )}
    </div>
  );
}
