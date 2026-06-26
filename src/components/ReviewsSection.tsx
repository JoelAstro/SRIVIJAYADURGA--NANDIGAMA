import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  message: string;
}

const PREDEFINED_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Sayyad Shama Ruksar',
    location: 'Nandigama',
    rating: 5,
    message: 'A wonderful dining experience with my family. The food was fresh, flavorful, and beautifully presented. The staff were friendly and attentive throughout our visit. Highly recommended.'
  },
  {
    id: '2',
    name: 'Joel Ramireddy',
    location: 'Hyderabad',
    rating: 5,
    message: 'Excellent food quality and quick service. The Chicken Dum Biryani and starters were outstanding. The restaurant ambiance is comfortable and perfect for family dinners and celebrations.'
  },
  {
    id: '3',
    name: 'Praisy',
    location: 'Hyderabad',
    rating: 5,
    message: 'The restaurant exceeded my expectations. Every dish was prepared perfectly, and the staff made us feel welcome. A great place to enjoy delicious food with friends and family.'
  },
  {
    id: '4',
    name: 'Pardhu Naidu',
    location: 'Kodada',
    rating: 5,
    message: 'Outstanding hospitality and amazing taste. The dining area was clean, well-maintained, and comfortable. I would definitely recommend this restaurant to anyone looking for quality food.'
  },
  {
    id: '5',
    name: 'Mahitha',
    location: 'Vijayawada',
    rating: 5,
    message: 'Loved the overall experience. The menu offers a great variety of dishes, and everything we ordered was fresh and delicious. The service was prompt and professional.'
  },
  {
    id: '6',
    name: 'Jayanth',
    location: 'Nandigama',
    rating: 5,
    message: 'One of the best restaurants in the area. The food was delicious, the service was excellent, and the atmosphere was perfect for spending quality time with family and friends. Will definitely visit again.'
  }
];

const ReviewsSection: React.FC = () => {
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
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PREDEFINED_REVIEWS.map(review => (
          <div 
            key={review.id}
            className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 glass"
          >
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{review.name}</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-450 flex items-center gap-0.5 mt-0.5">
                  📍 {review.location}
                </span>
              </div>
              
              <div className="flex items-center gap-0.5">
                {renderStars(review.rating)}
              </div>
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400 italic leading-relaxed pt-1">
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
