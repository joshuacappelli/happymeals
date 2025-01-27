"use client"; 

import React, { useContext, useState, useEffect } from "react";
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

/**
 * A panel that lets the user choose:
 *  1) Address/keyword (text input),
 *  2) Multiple restaurant types (multi-select),
 *  3) Distance (number input),
 *  4) Rank preference (select).
 *
 * When "Search" is clicked, calls onSearch(...) with all the selected values.
 */
const PlacesSelectionPanel: React.FC<PlacesSelectionPanelProps> = ({ onSearch }) => {
  // If you want to store the address in context, you can use it here:
  const { address, setAddress } = useContext(SearchContext);

  const [searchTerm, setSearchTerm] = useState<string>("");

  // setting how many results to return
  const [maxResults, setMaxResults] = useState<number>(10);
  
  // For multi-select restaurant types
  const [restaurantType, setRestaurantType] = useState<MultiValue[]>([]);

  // For distance (default 500m)
  const [distance, setDistance] = useState<number>(500);

  // For preference (MUST be a valid v1 value, like "BEST", "DISTANCE", or "RANK_PREFERENCE_UNSPECIFIED")
  const [preference, setPreference] = useState<string>("BEST");

  // Log address whenever it changes
  useEffect(() => {
    console.log("address set to", address);
  }, [address]);

  // "Search" button handler
  const handleSearch =  () => {
    // Convert the MultiValue[] to a string[] of the .value
    const primaryTypes = restaurantType.map((item) => item.value);
    setAddress(searchTerm);

    console.log("searchTerm", searchTerm);
    // Send these up to the parent
    onSearch(maxResults, distance, primaryTypes, preference);
  };

  return (
    <div className="flex flex-col items-center w-full justify-center pt-4">

      {/* Row for Address / Keyword input and Restaurant Types */}
      <div className="flex flex-row justify-center items-center mb-4">
        {/* 1. Address / Keyword input */}
        <div className="mr-4">
          <input
            type="text"
            placeholder="e.g. 123 Main St or 'Seafood'"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        {/* 2. Restaurant Types (multi-select) */}
        <div style={{ marginBottom: "1rem" }}>
          <Select
            options={restaurantTypes}
            isMulti
            value={restaurantType}
            onChange={(vals) => setRestaurantType(vals as MultiValue[])}
          />
        </div>

        <button 
        onClick={handleSearch}
        className="ml-2 bg-crimson text-white p-3 hover:bg-crimson/80 transition duration-300 focus:ring-2 focus:ring-crimson-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      </div>

      {/* Row for Distance, Max Results, and Preference */}
      <div className="flex flex-row mb-4">
        {/* 3. Distance (number input) */}
        <div className="rounded border p-2 mr-4 bg-white">
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            min={1}
            step={100}
            style={{ appearance: 'none', MozAppearance: 'textfield' }}
          />
        </div>

        {/* Max Results */}
        <div className="rounded border p-2 mr-4 bg-white">
          <label className="mr-2">Max Results:</label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            style={{ appearance: 'none', MozAppearance: 'textfield' }}
          />
        </div>

        {/* 4. Rank Preference (single select) */}
        <div className="rounded border p-2 bg-white">
          <label className="mr-2">Preference:</label>
          <select
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            style={{ appearance: 'none' }}
          >
            {preferenceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
};

export default PlacesSelectionPanel;
