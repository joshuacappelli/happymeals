import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const apiKey = process.env.GEOCODING_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "API key is not set" }, { status: 500 });
    }

    const searchparams = request.nextUrl.searchParams;
    const coordinates = searchparams.get("coordinates");
    const radius = searchparams.get("radius");
    const includedPrimaryTypes = searchparams.get("includedPrimaryTypes");

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates}&radius=${radius}&includedPrimaryTypes=${includedPrimaryTypes}&key=${apiKey}`;
}

