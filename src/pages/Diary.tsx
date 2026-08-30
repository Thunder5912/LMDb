import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ReviewCard from '../components/ReviewCard';

export default function Diary() {
  const { reviews, deleteReview } = useApp();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => (b.watchedDate < a.watchedDate ? -1 : b.watchedDate > a.watchedDate ? 1 : 0)),
    [reviews]
  );

  if (reviews.length === 0) {
    return (
      <div className="page">
        <h1>Diary</h1>
        <p className="muted">No films logged yet. Find a movie and log your first review.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Diary <span className="count">({reviews.length})</span></h1>
      <div className="diary-list">
        {sorted.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            onEdit={() => navigate(`/log/${r.tmdbId}/${r.id}`)}
            onDelete={() => {
              if (confirmId === r.id) {
                deleteReview(r.id);
                setConfirmId(null);
              } else {
                setConfirmId(r.id);
              }
            }}
          />
        ))}
      </div>
      {confirmId && <p className="muted">Click delete again to confirm.</p>}
    </div>
  );
}
