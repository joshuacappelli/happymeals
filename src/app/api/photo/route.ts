import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request : NextRequest) {
    
    const apiKey = process.env.GEOCODING_API_KEY;
    const name = request.nextUrl.searchParams.get("name");

    if (!apiKey) {
        return NextResponse.json({ error: "API key is not set" }, { status: 500 });
    }

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const url = `https://places.googleapis.com/v1/${encodeURIComponent(name)}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch data from Google Maps API for photos" }, { status: 500 });
    }
}