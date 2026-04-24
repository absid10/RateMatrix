import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: string;
}

export default function StarRating({ value, onChange, readonly = false, size = '1.2rem' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className={`star-rating ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        const isHovered = !readonly && star <= hoverValue;

        return (
          <span
            key={star}
            className={`star ${isFilled ? 'filled' : ''} ${isHovered ? 'hovered' : ''}`}
            style={{ fontSize: size }}
            onClick={() => {
              if (!readonly && onChange) {
                onChange(star);
              }
            }}
            onMouseEnter={() => {
              if (!readonly) setHoverValue(star);
            }}
            onMouseLeave={() => {
              if (!readonly) setHoverValue(0);
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
