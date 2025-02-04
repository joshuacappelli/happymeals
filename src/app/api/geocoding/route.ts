import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    const apiKey = process.env.GEOCODING_API_KEY;
    const address = request.nextUrl.searchParams.get("address");

    if (!apiKey) {
        return NextResponse.json({ error: "API key is not set" }, { status: 500 });
    }

    if (!address) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`;    

    try {
        const response = await fetch(url);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch data from Google Maps API" }, { status: 500 });
    }
}
