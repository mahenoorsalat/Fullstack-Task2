import React, { useState } from 'react';
import StarRating from './StarRating';
import { Company } from '../types';

interface LeaveReviewFormProps {
  company: Company;
  onReviewSubmit: (review: { rating: number; comment: string }) => void;
  // NEW: Props for handling edit mode
  initialRating?: number;
  initialComment?: string;
  submitButtonText?: string;
  onCancel?: () => void;
}

const LeaveReviewForm: React.FC<LeaveReviewFormProps> = ({ 
  company, 
  onReviewSubmit,
  // NEW: Use initial values if provided
  initialRating = 0,
  initialComment = '',
  submitButtonText = 'Post Review',
  onCancel,
}) => {
  // NEW: Initialize state with initial props for editing, otherwise use defaults
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    
    onReviewSubmit({ rating, comment });
    
    // Only clear the form if it was an initial post (no initialComment)
    if (!initialComment) {
      setRating(0);
      setComment('');
    }
    // If it was an edit, the parent component handles setting the form state back to view mode via onCancel or a re-render.
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      
      <div>
        <label htmlFor="comment" className="sr-only">Your Comment</label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          required
          placeholder={`Write your review for ${company.name}...`}
          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        {/* NEW: Conditional Cancel button for edit mode */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default LeaveReviewForm;