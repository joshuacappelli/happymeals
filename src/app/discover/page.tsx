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
    const [formatedAddress, setFormatedAddress] = useState<string>("");
  
    // Add state for parameters
    const [maxResults, setMaxResults] = useState<number>(10);
    const [distance, setDistance] = useState<number>(500);
    const [restaurantType, setRestaurantType] = useState<string[]>([]);
    const [preference, setPreference] = useState<string>("BEST");
    const [locationSet, setLocationSet] = useState<boolean>(false);

    const handleSearchparams = ( maxResults: number, distance: number, restaurantType: string[], preference: string) => {
        
        setMaxResults(maxResults);
        setDistance(distance);
        setRestaurantType(restaurantType);
        setPreference(preference);

        console.log("first handleSearchparams called");
        
    }
  
    useEffect(() => {
    const handleSearch = async () => {
      console.log("then handleSearch called");
      if (address === "" || address === null) {
        return;
      }
      setAddress(address);
      const data = await getCoordinates(address);
      const coordinates = data.results[0].geometry.location;
      setFormatedAddress(data.results[0].formatted_address);
      setCoordinates(coordinates);
    };

    handleSearch();
  }, [address]);

   
    useEffect(() => {

    const handleFetchPlaces = async () => {
      if (coordinates.lat === 0 && coordinates.lng === 0) {
        return;
      }
      console.log("finally handleFetchPlaces called");
      const body: PlacesRequestBody = {
        includedTypes: ["restaurant"],
        maxResultCount: maxResults,
        locationRestriction: {
          circle: {
            center: {
              latitude: coordinates.lat,
              longitude: coordinates.lng
            },
            radius: distance,
          },
        },
        rankPreference: preference,
        includedPrimaryTypes: restaurantType,
      };
  
      console.log("body is", body);
      // Call fetchPlaces function
      //const places = await fetchPlaces(body);
    };

    handleFetchPlaces();
  }, [coordinates]);
    
  
    return (
      <div className="flex flex-col items-center p-4">
        <h1 className="text-3xl font-bold mb-4">Discover</h1>
        <SearchPanel onSearch={handleSearchparams} />
        <p className="mt-4 text-lg font-semibold">Top results for: {formatedAddress}</p>
        <p className="text-md">Coordinates: {coordinates?.lat}, {coordinates?.lng}</p>
        <div className="content mt-6">
          {/* ... results ... */}
        </div>
      </div>
    );
  };

  export default DiscoverPage;