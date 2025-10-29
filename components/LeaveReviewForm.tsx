import React, { useState } from 'react';
import { Review } from '../types';
import { StarIcon } from './icons';

interface LeaveReviewFormProps {
  companyName: string;
  onSubmit: (review: Omit<Review, 'id' | 'date' | 'authorId'>) => void;
  onCancel: () => void;
}

const LeaveReviewForm: React.FC<LeaveReviewFormProps> = ({ companyName, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim() || !reviewerName.trim()) {
      alert('Please provide your name, a rating, and a comment.');
      return;
    }
    onSubmit({ reviewerName, rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-lg">Leave a review for <span className="font-bold">{companyName}</span></p>
       <div>
        <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700">Your Name</label>
        <input
          id="reviewerName"
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="flex items-center mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <StarIcon className={`h-8 w-8 transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          required
        ></textarea>
      </div>
       <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Cancel
        </button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-md transition-colors">
            Submit Review
        </button>
      </div>
    </form>
  );
};

export default LeaveReviewForm;