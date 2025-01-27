import { RestaurantType } from "@/app/lib/restaurantype";
import RestaurantCard from "./restaurantcard";

interface RestaurantCarouselProps {
    restaurants: RestaurantType[];
}

export default function RestaurantCarousel({ restaurants }: RestaurantCarouselProps) {
    return <div className="flex flex-col gap-2">{restaurants.map((restaurant) => <RestaurantCard restaurant={restaurant} />)}</div>;
}