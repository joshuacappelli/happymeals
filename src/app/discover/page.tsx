"use client";

import React, { useContext, useEffect, useRef, useState } from 'react';
import { SearchContext } from '@/app/context/searchcontext';
import PlacesSelectionPanel from '@/components/ui/searchpanel';
import getCoordinates from '../lib/geocoding';
import { fetchPlaces, PlacesRequestBody } from '../lib/fetchplaces';
import { RestaurantType } from '../lib/restaurantype';
import RestaurantCarousel from '@/components/ui/restaurantcarousel';
import Link from 'next/link';

const DiscoverPage = () => {
  const { address } = useContext(SearchContext);

  const [isclient, setIsclient] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const rawDomain = process.env.NEXT_PUBLIC_DOMAIN;
        if (!rawDomain) {
            console.error("DOMAIN environment variable is missing");
            return;
        }   

    const DOMAIN = rawDomain.replace(/(^\w+:|^)\/\//, "").replace(/\/+$/, "");
    const socket = new WebSocket(`wss://${DOMAIN}/ui-updates`);
    wsRef.current = socket;
  
    socket.onopen = () => {
      console.log("Connected to /ui-updates");
    };
  
    socket.onmessage = (event) => {
      console.log("Received from server:", event.data);
    };
  
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  
    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  
    return () => {
      socket.close();
      wsRef.current = null;
    };
  }, []);


  useEffect(() => {
    setIsclient(true);
  },[]);
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
    timeval: string,
    guestsval: number
  ) => {
    setMaxResults(maxResults);
    setDistance(distance);
    setRestaurantType(restaurantType);
    setPreference(preference);
    setTime(timeval);
    setGuests(guestsval)


    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "searchParams",
          time: timeval,
          guests: guestsval,
        })
      );
    }
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
    if (coordinates.lat === 0 || coordinates.lng === 0) {
        console.error("Invalid coordinates. API call skipped.");
        return;
    }


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
        console.log("Successfully fetched places:", places);
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

  if (!isclient) {
    return null;
  }

  console.log(time);
  console.log(guests);

  return (
    <div className="flex flex-col items-center p-4">
      <Link href="/" className="absolute top-4 left-4 hover:text-crimson transition-colors duration-300">Back to Home</Link>
      <h1 className="text-3xl font-bold mb-4">Discover</h1>
      
      <PlacesSelectionPanel onSearch={handleSearchParams} />

      {formattedAddress && (
      <div className="content mt-6">
        <div className="text-lg font-semibold">Results for {formattedAddress}</div>
      </div>
      )}

      <div className="content mt-6 w-full overflow-x-hidden">
        <RestaurantCarousel restaurants={places} />
      </div>

      
    </div>
  );
};

export default DiscoverPage;