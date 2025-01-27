import React, { useRef, useState } from "react";
import { RestaurantType } from "@/app/lib/restaurantype";
import RestaurantCard from "@/components/ui/restaurantcard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface RestaurantCarouselProps {
  restaurants: RestaurantType[];
}

const RestaurantCarousel: React.FC<RestaurantCarouselProps> = ({ restaurants }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 3; // Number of cards to show at once. Adjust based on screen size or make responsive.

  const totalCards = restaurants.length;

  const handlePrev = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth / cardsToShow;
      carouselRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleNext = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth / cardsToShow;
      carouselRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
      setCurrentIndex((prev) => Math.min(prev + 1, totalCards - cardsToShow));
    }
  };

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
      >
        {restaurants.map((restaurant, index) => (
          <div
            key={restaurant.displayName || index} // Ideally, use a unique identifier like restaurant.id
            className="flex-shrink-0 w-80 snap-start"
          >
            <RestaurantCard restaurant={restaurant} />
          </div>
        ))}
      </div>

      {/* Previous Button */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100 transition"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Next Button */}
      {currentIndex < totalCards - cardsToShow && (
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100 transition"
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default RestaurantCarousel;
