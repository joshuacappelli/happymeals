import { RestaurantType } from "@/app/lib/restaurantype";

interface RestaurantCardProps {
    restaurant: RestaurantType;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    return( 
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-bold">{restaurant.displayName}</h2>
        <p className="text-sm text-gray-500">{restaurant.primaryType}</p>
        <p className="text-sm text-gray-500">{restaurant.types?.slice(0, 3).join(", ")}</p>
        <p className="text-sm text-gray-500">{restaurant.formattedAddress}</p>
        <p className="text-sm text-gray-500">{restaurant.rating}</p>
        <p className="text-sm text-gray-500">{restaurant.ratingCount}</p>
        <p className="text-sm text-gray-500">{restaurant.priceLevel}</p>
        <p className="text-sm text-gray-500">{restaurant.priceRange}</p>
        <p className="text-sm text-gray-500">{restaurant.hours}</p>
        <p className="text-sm text-gray-500">{restaurant.phoneNumber}</p>
        <p className="text-sm text-gray-500">{restaurant.website}</p>
        <div className="flex flex-row gap-2">
            <img src={restaurant.photos?.[0]} alt={restaurant.displayName} className="w-16 h-16 rounded-lg" />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">View on maps</button>
    </div>);
}