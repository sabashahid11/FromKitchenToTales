import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ rating, onRatingChange, readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange(star)}
          disabled={readonly}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            size={28}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
