import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquareCode, PlusCircle } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  timestamp: number;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'K. Rajesh',
    rating: 5,
    message: 'The Chicken Dum Biryani here is absolutely legendary. Authentic spices, perfect texture, and very generous portions. Definitely coming back!',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: '2',
    name: 'Nikhitha G.',
    rating: 4,
    message: 'Excellent dining experience. The A/C hall was really clean and comfortable. Tried Paneer Majestic and Butter Naan, both were delicious.',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: '3',
    name: 'M. Sridhar',
    rating: 5,
    message: 'Hands down the best catering service in Nandigama. We booked them for our family function and everyone was full of praise for the food quality.',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000
  }
];

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Load reviews
  useEffect(() => {
    const stored = localStorage.getItem('svd_reviews');
    if (stored) {
      setReviews(JSON.parse(stored));
    } else {
      setReviews(DEFAULT_REVIEWS);
      localStorage.setItem('svd_reviews', JSON.stringify(DEFAULT_REVIEWS));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      message: message.trim(),
      timestamp: Date.now()
    };

    const nextReviews = [newReview, ...reviews];
    setReviews(nextReviews);
    localStorage.setItem('svd_reviews', JSON.stringify(nextReviews));

    setName('');
    setRating(5);
    setMessage('');
    setShowForm(false);
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
          className="flex items-center gap-1.5 px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md transition-all hover:opacity-90"
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
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none"
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
                  className="p-1 hover:scale-110 transition-transform"
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
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md hover:opacity-90"
          >
            Submit Review
          </button>
        </form>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div 
            key={review.id}
            className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 glass"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 italic leading-relaxed">
                "{review.message}"
              </p>
            </div>
            
            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/40 pt-3 mt-4">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{review.name}</span>
              <span className="text-[9px] text-neutral-400">{new Date(review.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ReviewsSection;
