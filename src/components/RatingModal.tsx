import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    doctor_name: string;
    hospital_name: string;
  };
  onSubmitRating: (appointmentId: string, rating: number, review: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSubmitRating
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmitRating(appointment.id, rating, review);
      onClose();
      setRating(0);
      setReview('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="modal-3d w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gradient">Rate Your Experience</h3>
          <button onClick={onClose} className="text-dark-muted hover:text-dark p-2 hover:bg-gray-100 rounded-full transition-all-smooth">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 glass-effect p-4 rounded-xl">
          <h4 className="font-bold text-dark text-lg">{appointment.doctor_name}</h4>
          <p className="text-sm text-dark-secondary font-medium">{appointment.hospital_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-dark mb-3">
              How was your experience?
            </label>
            <div className="flex space-x-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-2 transition-all-smooth hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-dark-secondary mt-2 text-center font-bold">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-dark mb-3">
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Share your experience (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="input-3d w-full px-4 py-3"
              placeholder="Tell others about your experience..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-3d px-6 py-3 rounded-xl font-bold text-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="flex-1 btn-danger-3d px-6 py-3 rounded-xl font-bold text-white hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;