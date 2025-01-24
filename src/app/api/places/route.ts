import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEOCODING_API_KEY;
    
  if (!apiKey) {
    return NextResponse.json({ error: "API key is not set" }, { status: 500 });
  }

  try {
    // Read the JSON body from the incoming request
    const body = await request.json();

    // Build the URL with `key` as a query parameter
    const url = `https://places.googleapis.com/v1/places:searchNearby?fields=*&key=${apiKey}`;

    // POST to Google with the same body
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    // Return the data from Google as JSON
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data from Google Maps API" },
      { status: 500 }
    );
  }
}
