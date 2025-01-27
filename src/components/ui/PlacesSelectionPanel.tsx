"use client";

import React, { useContext, useState } from "react";
import Select from "react-select";
import { SearchContext } from "@/app/context/searchcontext";
import { MultiValue, restaurantTypes, preferenceOptions } from "@/app/lib/searchtypes";

interface PlacesSelectionPanelProps {
  onSearch: (
    maxResults: number, 
    radius: number, 
    primaryTypes: string[], 
    preference: string
  ) => void;
}

const PlacesSelectionPanel: React.FC<PlacesSelectionPanelProps> = ({ onSearch }) => {
  const { address, setAddress } = useContext(SearchContext);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [maxResults, setMaxResults] = useState<number>(10);
  const [distance, setDistance] = useState<number>(500);
  const [restaurantType, setRestaurantType] = useState<MultiValue[]>([]);
  const [preference, setPreference] = useState<string>("BEST");

  const handleSearch = () => {
    const primaryTypes = restaurantType.map((item) => item.value);
    onSearch(maxResults, distance, primaryTypes, preference);
  };

  return (
    <div>
      {/* Your input fields and select components here */}
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default PlacesSelectionPanel; 