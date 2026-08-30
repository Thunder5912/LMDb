import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useApp();

  if (watchlist.length === 0) {
    return (
      <div className="page">
        <h1>Watchlist</h1>
        <p className="muted">Your watchlist is empty. Add films from a movie page.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Watchlist <span className="count">({watchlist.length})</span></h1>
      <div className="grid">
        {watchlist.map((w) => (
          <div key={w.id} className="watchlist-item">
            <MovieCard id={w.id} title={w.title} posterPath={w.posterPath} releaseDate={w.releaseDate} />
            <button className="btn small danger" onClick={() => removeFromWatchlist(w.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
