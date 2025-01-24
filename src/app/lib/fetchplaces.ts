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

async function fetchPlaces(body: PlacesRequestBody) {
    try {
        const response = await fetch("/api/places", {
            method: "POST",
            headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching places:", error);
        throw error;
    }
}

export { fetchPlaces };
export type { PlacesRequestBody };