import { RestaurantType } from "@/app/lib/restaurantype";
import  CallButton  from "@/components/ui/callbutton";
import getPhotos from "@/app/lib/fetchphoto";
import TranscriptModal from "./transcriptModal";
import { useState, useEffect } from "react";

interface RestaurantCardProps {
    restaurant: RestaurantType;
}


export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const {
      displayName,
      primaryType,
      types = [],
      formattedAddress,
      rating,
      ratingCount,
      priceRange,
      hours,
      phoneNumber,
      website,
      photos = [],
    } = restaurant;

    const [photo, setPhoto] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);


    async function renderPhoto() {
      const image = await getPhotos(photos[0].name);
      setPhoto(image.photoUri);
      setIsLoading(false);
    }

    useEffect(() => {
      renderPhoto();
    }, []);
    
  
    // Helper to render star rating (up to 5 stars). Adjust logic or limit to your needs.
    const renderStars = () => {
      if (rating === undefined) return null;
  
      // Round rating or adapt for half-stars if needed
      const roundedRating = Math.round(rating);
  
      return (
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 mr-1 ${
                i < roundedRating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.971a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.38 2.453a1 1 0 00-.363 1.118l1.287 3.971c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.379 2.453c-.784.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.363-1.119L2.623 9.398c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
            </svg>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {ratingCount ? `(${ratingCount} reviews)` : null}
          </span>
        </div>
      );
    };
  
    // Limit the list of types to 3
    const displayTypes = types.slice(0, 4);

    
    if(isLoading) {
      return;
    }

    return (
      <div className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Featured Image */}
        {photos.length > 0 && (
          <div className="relative w-full h-48">
            <img
              src={photo}
              alt={displayName || "Restaurant"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        {/* Fallback if no photo */}
        {photos.length === 0 && (
          <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}
  
        {/* Card Content */}
        <div className="p-4">
          {/* Restaurant Name */}
          <h2 className="text-xl font-semibold mb-2">
            {displayName ?? "Unknown Restaurant"}
          </h2>
  
          {/* Primary Type (if you want it displayed) */}
          {primaryType && (
            <p className="text-sm font-medium text-crimson mb-2">
              {primaryType}
            </p>
          )}
  
          {/* Restaurant Types (up to 3 as badges) */}
          {displayTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {displayTypes.map((type, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-300 text-crimson px-2 py-1 rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
  
          {/* Rating */}
          {rating !== undefined && (
            <div className="mb-2">
              {renderStars()}
            </div>
          )}
  
          {/* Address */}
          {formattedAddress && (
            <p className="text-sm text-gray-600 mb-2">{formattedAddress}</p>
          )}
  
          {/* Price Range */}
          {priceRange && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Price Range:</span> {priceRange}
            </p>
          )}
  
          {/* Opening Hours */}
          {hours && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Hours:</span> {hours}
            </p>
          )}
  
          {/* Phone Number */}
          {phoneNumber && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Phone:</span> {phoneNumber}
            </p>
          )}
  
          {/* Website Link */}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:underline mb-2 inline-block"
            >
              Visit Website
            </a>
          )}
  
            
        </div>
        <div  className="p-4">
          <CallButton phoneNumber={"+19419283484"}
                      onCallStart={() => setIsModalOpen(true)} 
                      />
        </div>
        <TranscriptModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      </div>

      
    );
  }