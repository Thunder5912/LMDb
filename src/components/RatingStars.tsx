import { useState } from 'react';

interface Props {
  value: number; // 0 - 5, accepts 0.5 steps
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

export default function RatingStars({ value, onChange, readOnly = false, size = 28 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="stars" style={{ fontSize: size }} role={readOnly ? 'img' : 'slider'} aria-label={`Rating ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, display - (star - 1)));
        return (
          <span
            key={star}
            className={'star' + (readOnly ? ' read' : ' interactive')}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => {
              if (readOnly || !onChange) return;
              // Click lower half = .5, upper half = full
              const el = (event as MouseEvent).currentTarget as HTMLElement;
              const rect = el.getBoundingClientRect();
              const x = (event as MouseEvent).clientX - rect.left;
              const half = x < rect.width / 2;
              onChange(star - (half ? 0.5 : 0));
            }}
          >
            <span className="star-bg">★</span>
            <span className="star-fg" style={{ width: `${fill * 100}%` }}>★</span>
          </span>
        );
      })}
    </div>
  );
}
