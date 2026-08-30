import { Link } from 'react-router-dom';
import { posterUrl } from '../lib/api';

interface Props {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate?: string;
  rating?: number;
  subtitle?: string;
}

export default function MovieCard({ id, title, posterPath, releaseDate, rating, subtitle }: Props) {
  const year = releaseDate ? releaseDate.slice(0, 4) : '';
  return (
    <Link to={`/movie/${id}`} className="movie-card">
      <div className="movie-poster">
        {posterPath ? (
          <img src={posterUrl(posterPath, 'w300')} alt={title} loading="lazy" />
        ) : (
          <div className="poster-fallback">No image</div>
        )}
        {typeof rating === 'number' && rating > 0 && <span className="movie-badge">{rating.toFixed(1)}</span>}
      </div>
      <div className="movie-meta">
        <div className="movie-title" title={title}>{title}</div>
        <div className="movie-sub">{subtitle ?? year}</div>
      </div>
    </Link>
  );
}
