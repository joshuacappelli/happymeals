"use client";

import React, { useContext, useEffect, useState } from 'react';
import { SearchContext } from '@/app/context/searchcontext';
import PlacesSelectionPanel from '@/components/ui/searchpanel';
import getCoordinates from '../lib/geocoding';
import { fetchPlaces, PlacesRequestBody } from '../lib/fetchplaces';
import RestaurantCard from '@/components/ui/restaurantcard';
import { RestaurantType } from '../lib/restaurantype';
import RestaurantCarousel from '@/components/ui/restaurantcarousel';

const DiscoverPage = () => {
  const { address } = useContext(SearchContext);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [formattedAddress, setFormattedAddress] = useState<string>("");

  // State for search parameters
  const [maxResults, setMaxResults] = useState<number>(10);
  const [distance, setDistance] = useState<number>(500);
  const [restaurantType, setRestaurantType] = useState<string[]>([]);
  const [preference, setPreference] = useState<string>("POPULARITY");
  const [time, setTime] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [places, setPlaces] = useState<RestaurantType[]>([]);


  const handleSearchParams = (
    maxResults: number,
    distance: number,
    restaurantType: string[],
    preference: string,
    time: string,
    guests: number
  ) => {
    setMaxResults(maxResults);
    setDistance(distance);
    setRestaurantType(restaurantType);
    setPreference(preference);
    setTime(time);
    setGuests(guests);

    console.log("results from searchpanel");
    console.log(maxResults, distance, restaurantType, preference, time, guests);
  };

  const handleSearch = async () => {
    if (!address) return;

    try {
      const data = await getCoordinates(address);
      const coordinates = data.results[0].geometry.location;
      setFormattedAddress(data.results[0].formatted_address);
      setCoordinates(coordinates);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const handleFetchPlaces = async () => {
    if (coordinates.lat === 0 && coordinates.lng === 0) return;

    const body: PlacesRequestBody = {
      includedTypes: ["restaurant"],
      maxResultCount: maxResults,
      locationRestriction: {
        circle: {
          center: {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          },
          radius: distance,
        },
      },
      rankPreference: preference,
      includedPrimaryTypes: restaurantType,
    };

    try {
      const places = await fetchPlaces(body);
      setPlaces(places);
      console.log("Fetched places:", places);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  useEffect(() => {
    if (address) {
      handleSearch();
    }
  }, [address]);

  useEffect(() => {
    if (coordinates.lat !== 0 && coordinates.lng !== 0) {
      handleFetchPlaces();
    }
  }, [coordinates, maxResults, distance, restaurantType, preference]);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Discover</h1>
      <PlacesSelectionPanel onSearch={handleSearchParams} />
      <div className="content mt-6">
        <RestaurantCarousel restaurants={places} />
      </div>

      <div className="content mt-6">
        <span className="text-lg font-semibold">Results for {formattedAddress}</span>
      </div>
    </div>
  );
};

export default DiscoverPage;