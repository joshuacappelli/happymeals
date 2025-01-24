"use client";

import React from 'react';
import { SearchContext } from '@/app/context/searchcontext';
import SearchPanel from '@/components/ui/searchpanel';
import { useContext, useEffect, useState } from 'react';
import getCoordinates from '../lib/geocoding';
import { fetchPlaces, PlacesRequestBody } from '../lib/fetchplaces';

const DiscoverPage = () => {

    const { address, setAddress } = useContext(SearchContext);
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number }>({ lat: 0, lng: 0 });

    const handleSearch = async (address: string) => {

        if (address === "" || address === null) {
            return;
        }

        setAddress(address);
        const data = await getCoordinates(address);
        const coordinates = data.results[0].geometry.location;
        setAddress(data.results[0].formatted_address);
        setCoordinates(coordinates);
        console.log("coordinates", coordinates);    
    };

    useEffect(() => {
        handleSearch(address);
    }, []);

    useEffect(() => {
        handleFetchPlaces(10, 1000, ["restaurant"], "DISTANCE");
    }, [coordinates]);

    const handleFetchPlaces = async (maxresults : number, radius : number, primarytypes : string[], preference : string) => {
        
        if (coordinates.lat === 0 && coordinates.lng === 0) {
            return;
        }
        
        const body: PlacesRequestBody = {
            includedTypes: ["restaurant"],
            maxResultCount: maxresults,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: coordinates.lat,
                        longitude: coordinates.lng
                    },
                    radius: radius
                }
            },
            rankPreference: preference,
            includedPrimaryTypes: primarytypes,
        };

        console.log("body is", body);

        const places = await fetchPlaces(body);
        console.log(places);
    };
    
    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold mb-4">Discover</h1>
            <SearchPanel onSearch={handleFetchPlaces} />
            <p className="mt-4 text-lg font-semibold">Top results for: {address}</p>
            <p className="text-md">Coordinates: {coordinates?.lat}, {coordinates?.lng}</p>
            <div className="content mt-6">
                {/* ... existing content ... */}
            </div>
        </div>
    );
};

export default DiscoverPage;
