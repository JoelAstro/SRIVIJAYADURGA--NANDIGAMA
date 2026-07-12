import React, { useState } from 'react';
import { Star, User, MessageSquareCode, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ReviewsSection: React.FC = () => {
  const { reviews, addReview } = useApp();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Submit review with PENDING status
      await addReview(name.trim(), rating, message.trim(), 'PENDING', location.trim());

      setName('');
      setLocation('');
      setRating(5);
      setMessage('');
      setShowForm(false);
      
      // Notify the user that the review is pending moderation
      alert('Thank you! Your testimonial has been submitted and will appear on the homepage once approved by our team.');
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star 
        key={idx}
        className={`w-3.5 h-3.5 ${
          idx < count ? 'text-saffron fill-saffron' : 'text-neutral-300 dark:text-neutral-700'
        }`}
      />
    ));
  };

  return (
    <div className="w-full space-y-8">
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">Customer Testimonials</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Honest feedback from our lovely diners</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md transition-all hover:opacity-90 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> {showForm ? 'Close Form' : 'Write a Review'}
        </button>
      </div>

      {/* Write review Form */}
      {showForm && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-6 rounded-3xl shadow-md space-y-4 max-w-lg mx-auto glass"
        >
          <h4 className="font-logo font-bold text-sm text-maroon dark:text-saffron">Share Your Experience</h4>
          
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Your Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <User className="w-4 h-4" />
              </span>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Location</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <span className="text-xs">📍</span>
              </span>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nandigama"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Rating</label>
            <div className="flex gap-2.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer border-none bg-transparent"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-saffron fill-saffron' : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Review Message</label>
            <div className="relative">
              <span className="absolute top-3 left-3.5 text-neutral-400">
                <MessageSquareCode className="w-4 h-4" />
              </span>
              <textarea 
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What did you like about our food or hospitality?..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md hover:opacity-90 cursor-pointer border-none transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.filter(r => r.status === 'APPROVED').map(review => (
          <div 
            key={review.id}
            className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 glass min-h-[160px] space-y-4"
          >
            <div className="space-y-2.5 flex-grow flex flex-col">
              {/* 1. Ratings (★★★★★) */}
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              
              {/* 2. Customer Name */}
              <h5 className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">
                {review.name}
              </h5>

              {/* 3. Location (📍 Location, hidden if empty) */}
              {review.location && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-maroon dark:text-saffron">
                  <span>📍</span>
                  <span>{review.location}</span>
                </div>
              )}

              {/* 4. Review Message (high contrast, readable color) */}
              <p className="text-xs text-neutral-900 dark:text-neutral-100 font-medium italic leading-relaxed pt-1 flex-grow">
                "{review.message}"
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ReviewsSection;
