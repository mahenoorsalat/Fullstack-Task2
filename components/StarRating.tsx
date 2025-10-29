import React from 'react';
import { StarIcon } from './icons';

interface StarRatingProps {
  rating: number;
  totalReviews: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, totalReviews }) => {
  if (totalReviews === 0) {
    return <div className="h-5 mt-1"><span className="text-xs text-gray-500 italic">No reviews yet</span></div>;
  }

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      // Full star
      stars.push(<StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400" />);
    } else if (i > rating && i - 1 < rating) {
      // Partial star
      const percentage = (rating - (i - 1)) * 100;
      stars.push(
        <div key={`partial-${i}`} className="relative inline-block">
          <StarIcon className="h-4 w-4 text-gray-300" />
          <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${percentage}%` }}>
            <StarIcon className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      );
    } else {
      // Empty star
      stars.push(<StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
  }

  return (
    <div className="flex items-center space-x-1 mt-1">
      <span className="font-bold text-sm text-yellow-500">{rating.toFixed(1)}</span>
      <div className="flex">{stars}</div>
      <span className="text-xs text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
    </div>
  );
};

export default StarRating;
