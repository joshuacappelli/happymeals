import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEOCODING_API_KEY;
    
  if (!apiKey) {
    console.error("API Key is missing");
    return NextResponse.json({ error: "API key is not set" }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log("Received Request Body:", body);

    const url = `https://places.googleapis.com/v1/places:searchNearby?fields=*&key=${apiKey}`;
    console.log("Fetching from Google API:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Google API Response Status:", response.status);

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Google API Error:", errorResponse);
      return NextResponse.json({ error: "Google API request failed", details: errorResponse }, { status: response.status });
    }

    const data = await response.json();
    console.log("Google API JSON Response:", data);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Unexpected API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Google Maps API" },
      { status: 500 }
    );
  }
}
