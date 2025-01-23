"use client";

import React from 'react';
import { SearchBar2 } from '@/components/form/searchbar';
import { SearchContext } from '@/app/context/searchcontext';
import { useContext, useEffect, useState } from 'react';
import getCoordinates from '../lib/geocoding';

const DiscoverPage = () => {

    const { address, setAddress } = useContext(SearchContext);
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

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
    
    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold mb-4">Discover</h1>
            <SearchBar2 onsearch={handleSearch} />
            <p className="mt-4 text-lg font-semibold">Top results for: {address}</p>
            <p className="text-md">Coordinates: {coordinates?.lat}, {coordinates?.lng}</p>
            <div className="content mt-6">
                {/* ... existing content ... */}
            </div>
        </div>
    );
};

export default DiscoverPage;
