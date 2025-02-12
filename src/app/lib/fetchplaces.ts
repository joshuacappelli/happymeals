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

  interface PriceRange {
    startPrice?: { units: string };
    endPrice?: { units: string };
}

interface OpeningHours {
    openNow?: string;
}

interface photo {
    googleMapsUri?: string;
    name: string;
}

interface PlaceApiResponse {
    displayName?: { text: string };
    primaryTypeDisplayName?: { text: string };
    types?: string[];
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: number;
    priceRange?: PriceRange;
    currentOpeningHours?: OpeningHours;
    regularOpeningHours?: OpeningHours;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    photos?: photo[];
}



function formatPlacesResponse(places: PlaceApiResponse[]): RestaurantType[] {
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
                    ? `$${place.priceRange.startPrice.units} - $${place.priceRange.endPrice.units} per person`
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


// async function fetchPlaces(body: PlacesRequestBody): Promise<RestaurantType[]> {
//     try {
//         const response = await fetch("/api/places", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(body),
//         });

//         const text = await response.text();
//         if (!text) {
//             throw new Error("Empty response from API");
//         }

//         let data;
//         try {
//             data = JSON.parse(text);
//         } catch (err) {
//             console.log(err);
//             throw new Error(`Invalid JSON response: ${text}`);
//         }

//         console.log("API Response:", data);

//         if (!data.places || !Array.isArray(data.places)) {
//             throw new Error("Invalid API response format: Missing 'places' array.");
//         }

//         return formatPlacesResponse(data.places);
//     } catch (error) {
//         console.error("Error fetching places:", error);
//         throw error;
//     }
// }


// export { fetchPlaces };
// export type { PlacesRequestBody };

async function fetchPlaces(body: PlacesRequestBody): Promise<RestaurantType[]> {
    try {
        const response = await fetch("/api/places", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`API request failed with status ${response.status}`);
            throw new Error(`API request failed with status ${response.status}`);
        }

        let data;
        try {
            data = await response.json();
        } catch (err) {
            console.error("Invalid JSON response:", err);
            throw new Error("API returned invalid JSON");
        }

        console.log("API Response:", data);

        if (!data.places || !Array.isArray(data.places)) {
            console.error("Invalid API response format: Missing 'places' array.");
            throw new Error("Invalid API response format: Missing 'places' array.");
        }

        return formatPlacesResponse(data.places);
    } catch (error) {
        console.error("Error fetching places:", error);
        throw error;
    }
}

export { fetchPlaces };
export type { PlacesRequestBody };
