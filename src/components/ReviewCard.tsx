import { useRef, useState } from 'react';
import RatingStars from './RatingStars';
import { shareElementAsImage } from '../lib/shareImage';
import { posterUrl } from '../lib/api';
import { Review } from '../lib/types';

interface Props {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ReviewCard({ review, onEdit, onDelete, showActions = true }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleShare() {
    if (!cardRef.current) return;
    setBusy(true);
    setMsg('');
    try {
      const result = await shareElementAsImage(cardRef.current, `lmdb-review-${review.tmdbId}.png`);
      if (result === 'shared') setMsg('Shared!');
      else if (result === 'downloaded') setMsg('Saved as image.');
    } catch {
      setMsg('Could not create image.');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(''), 2500);
    }
  }

  return (
    <div className="review-card-wrap">
      <div className="review-card" ref={cardRef}>
        <div className="review-head">
          {review.posterPath ? (
            <img className="review-poster" src={posterUrl(review.posterPath, 'w200')} alt={review.title} crossOrigin="anonymous" />
          ) : (
            <div className="review-poster fallback">No image</div>
          )}
          <div className="review-head-text">
            <div className="review-title">{review.title}</div>
            <div className="review-date">{fmtDate(review.watchedDate)}</div>
            {review.rewatch && <span className="rewatch-tag">Rewatch</span>}
          </div>
          <div className="review-rating">
            <RatingStars value={review.rating} readOnly size={20} />
          </div>
        </div>
        {review.review && <p className="review-text">{review.review}</p>}
        {review.tags.length > 0 && (
          <div className="tag-row">
            {review.tags.map((t) => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {showActions && (
        <div className="review-actions">
          <button className="btn small" onClick={handleShare} disabled={busy}>
            {busy ? '...' : 'Share image'}
          </button>
          {onEdit && (
            <button className="btn small" onClick={onEdit}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="btn small danger" onClick={onDelete}>
              Delete
            </button>
          )}
          {msg && <span className="inline-msg">{msg}</span>}
        </div>
      )}
    </div>
  );
}
