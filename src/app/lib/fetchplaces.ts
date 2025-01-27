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
        // Check if phoneNumber exists before pushing the place to the formattedPlaces array
        if (place.nationalPhoneNumber) {
            formattedPlaces.push({
                displayName: place.displayName?.text || undefined,
                primaryType: place.primaryTypeDisplayName?.text || undefined,
                types: place.types || undefined,
                formattedAddress: place.formattedAddress || undefined,
                rating: place.rating || undefined,
                ratingCount: place.userRatingCount || undefined,
                priceLevel: place.priceLevel || undefined,
                priceRange: place.priceRange?.startPrice?.units && place.priceRange?.endPrice?.units
                    ? "$" + place.priceRange.startPrice.units + " - " + "$" + place.priceRange.endPrice.units + " per person"
                    : undefined,
                hours: place.currentOpeningHours?.openNow || place.regularOpeningHours?.openNow || undefined,
                phoneNumber: place.nationalPhoneNumber || undefined,
                website: place.websiteUri || undefined,
                photos: place.photos || undefined,
            });
        }
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
        console.log(data);
        return formatPlacesResponse(data.places);
    } catch (error) {
        console.error("Error fetching places:", error);
        throw error;
    }
}

export { fetchPlaces };
export type { PlacesRequestBody };