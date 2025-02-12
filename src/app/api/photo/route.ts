

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const apiKey = process.env.GEOCODING_API_KEY; // Replace with your API key
    const name = request.nextUrl.searchParams.get("name");

    if (!apiKey) {
        return NextResponse.json({ error: "API key is not set" }, { status: 500 });
    }

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }


    // Construct the correct URL
    const url = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=400&maxWidthPx=400&skipHttpRedirect=true&key=${apiKey}`;

    try {
        // Fetch the photo from Google Places API
        const response = await fetch(url);

        // Check if the response is a redirect (image URLs sometimes redirect)
        if (response.redirected) {
            return NextResponse.redirect(response.url);
        }

        // If it's not a redirect, return the actual response
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching photo:", error);
        return NextResponse.json({ error: "Failed to fetch data from Google Places API" }, { status: 500 });
    }
}
