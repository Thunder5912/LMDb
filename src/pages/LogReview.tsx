import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovie, posterUrl, TmdbMovie } from '../lib/api';
import { useApp } from '../context/AppContext';
import RatingStars from '../components/RatingStars';

export default function LogReview() {
  const { id, reviewId } = useParams();
  const navigate = useNavigate();
  const { getReviewForMovie, addReview, updateReview } = useApp();
  const tmdbId = id ?? '';
  const existing = reviewId ? getReviewForMovie(tmdbId) : undefined;

  const [movie, setMovie] = useState<TmdbMovie | null>(null);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [review, setReview] = useState(existing?.review ?? '');
  const [watchedDate, setWatchedDate] = useState(existing?.watchedDate ?? new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '');
  const [rewatch, setRewatch] = useState(existing?.rewatch ?? false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMovie(tmdbId)
      .then((m) => !cancelled && setMovie(m))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  function save() {
    if (rating === 0) {
      setError('Please pick a rating.');
      return;
    }
    const tagList = tags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    const payload = {
      tmdbId,
      title: existing?.title ?? movie?.title ?? 'Unknown',
      posterPath: existing?.posterPath ?? movie?.poster_path ?? null,
      rating,
      review: review.trim(),
      watchedDate,
      tags: tagList,
      rewatch,
    };
    if (existing) {
      updateReview(existing.id, payload);
    } else {
      addReview(payload);
    }
    navigate('/diary');
  }

  return (
    <div className="page log">
      <h1>{existing ? 'Edit review' : 'Log a film'}</h1>
      {movie && (
        <div className="log-movie">
          <img src={posterUrl(movie.poster_path, 'w200')} alt={movie.title} />
          <div>
            <div className="log-title">{movie.title}</div>
            <div className="muted">{movie.release_date?.slice(0, 4)}</div>
          </div>
        </div>
      )}
      {error && <p className="err">{error}</p>}

      <div className="form">
        <label className="field">
          <span>Your rating</span>
          <RatingStars value={rating} onChange={setRating} />
        </label>

        <label className="field">
          <span>Review</span>
          <textarea
            rows={6}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="What did you think?"
          />
        </label>

        <label className="field">
          <span>Watched date</span>
          <input type="date" value={watchedDate} onChange={(e) => setWatchedDate(e.target.value)} />
        </label>

        <label className="field">
          <span>Tags (comma separated)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="sci-fi, noir" />
        </label>

        <label className="checkbox">
          <input type="checkbox" checked={rewatch} onChange={(e) => setRewatch(e.target.checked)} />
          <span>Rewatch</span>
        </label>

        <div className="row">
          <button className="btn primary" onClick={save}>Save review</button>
          <button className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
