import { RestaurantType } from "./restaurantype";

interface PlacesRequestBody {
    includedTypes: string[];
    maxResultCount: number;
    locationRestriction: {
      circle: {
        center: { latitude: number; longitude: number };
        radius: number;
      };
    };
    rankPreference: string;
    includedPrimaryTypes: string[];
  }


function formatPlacesResponse(places: any): RestaurantType[] {
    const formattedPlaces: RestaurantType[] = [];
    for (const place of places) {
        formattedPlaces.push({
            displayName: place.displayName || undefined,
            primaryType: place.primaryType || undefined,
            types: place.types || undefined,
            formattedAddress: place.formattedAddress || undefined,
            rating: place.rating || undefined,
            ratingCount: place.ratingCount || undefined,
            priceLevel: place.priceLevel || undefined,
            priceRange: place.priceRange || undefined,
            hours: place.hours || undefined,
            phoneNumber: place.phoneNumber || undefined,
            website: place.website || undefined,
            photos: place.photos || undefined,
        });
    }
    return formattedPlaces;
}

async function fetchPlaces(body: PlacesRequestBody): Promise<RestaurantType[]> {
    try {
        const response = await fetch("/api/places", {
            method: "POST",
            headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

        const data = await response.json();
        return formatPlacesResponse(data);
    } catch (error) {
        console.error("Error fetching places:", error);
        throw error;
    }
}

export { fetchPlaces };
export type { PlacesRequestBody };