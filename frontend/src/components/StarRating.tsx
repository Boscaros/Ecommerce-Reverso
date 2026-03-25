import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, readOnly = false, onChange, size = 20 }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Avaliação em estrelas">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-checked={rating >= star}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange && onChange(star)}
          >
            <Star
              size={size}
              className={`${isActive ? 'fill-yellow-400 text-yellow-500' : 'fill-transparent text-gray-300'} transition-colors duration-200`}
            />
          </button>
        );
      })}
    </div>
  );
}
