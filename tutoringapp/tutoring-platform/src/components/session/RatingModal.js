import React, { useState } from 'react';
import { ratingsAPI } from '../../services/api';

const RatingModal = ({ sessionId, onClose, onSubmitSuccess }) => {
  const [ratings, setRatings] = useState({
    punctuality: 0,
    friendliness: 0,
    helpfulness: 0,
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { key: 'punctuality', label: 'Punctuality', icon: '⏰', description: 'Was the tutor on time?' },
    { key: 'friendliness', label: 'Friendliness', icon: '😊', description: 'Was the tutor friendly and approachable?' },
    { key: 'helpfulness', label: 'Helpfulness', icon: '💡', description: 'Was the tutor helpful and clear?' },
  ];

  const handleStarClick = (category, rating) => {
    setRatings({ ...ratings, [category]: rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all ratings are selected
    if (ratings.punctuality === 0 || ratings.friendliness === 0 || ratings.helpfulness === 0) {
      setError('Please rate all categories');
      return;
    }

    setSubmitting(true);

    try {
      await ratingsAPI.submitRating(sessionId, {
        punctuality: ratings.punctuality,
        friendliness: ratings.friendliness,
        helpfulness: ratings.helpfulness,
        comment: comment.trim() || null,
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Rate Your Session</h2>
        <p className="text-gray-600 mb-6">Help us improve by rating your tutor</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Categories */}
          {categories.map((category) => (
            <div key={category.key} className="border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{category.label}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(category.key, star)}
                    className={`text-3xl transition ${
                      star <= ratings[category.key]
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-sm text-gray-600 self-center ml-2">
                  {ratings[category.key] > 0 ? `${ratings[category.key]}/5` : 'Not rated'}
                </span>
              </div>
            </div>
          ))}

          {/* Comment */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share any additional feedback..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">{comment.length}/500 characters</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-full font-medium disabled:opacity-50 transition-all"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full font-medium disabled:opacity-50 transition-all shadow-lg hover:shadow-purple-500/50"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;

