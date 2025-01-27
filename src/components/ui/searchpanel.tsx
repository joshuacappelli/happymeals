"use client";

import React, { useContext, useState } from "react";
import Select from "react-select";
import { SearchContext } from "@/app/context/searchcontext";
import { MultiValue, restaurantTypes, preferenceOptions } from "@/app/lib/searchtypes";

interface PlacesSelectionPanelProps {
  onSearch: (
    maxResults: number,
    distance: number,
    primaryTypes: string[],
    preference: string,
    time: string,
    guests: number
  ) => void;
}

const PlacesSelectionPanel: React.FC<PlacesSelectionPanelProps> = ({ onSearch }) => {
  const { setAddress } = useContext(SearchContext);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [maxResults, setMaxResults] = useState<number>(10);
  const [restaurantType, setRestaurantType] = useState<MultiValue[]>([]);
  const [distance, setDistance] = useState<number>(500);
  const [preference, setPreference] = useState<string>("POPULARITY");
  const [time, setTime] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);


  const handleSearch = () => {
    const primaryTypes = restaurantType.map((item) => item.value);
    setAddress(searchTerm);
    onSearch(maxResults, distance, primaryTypes, preference, time, guests);
  };

  return (
    <div className="flex flex-col items-center w-full justify-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Find Restaurants</h2>

      {/* Row for Address / Keyword input and Restaurant Types */}
      <div className="flex flex-col md:flex-row w-full gap-4 mb-6">
        {/* 1. Address / Keyword input */}
        <div className="flex-1">
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson focus:border-transparent transition-all"
          />
        </div>

        <div className="w-min">
          <input
            type="number"
            min={1}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-min p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson focus:border-transparent transition-all"
            placeholder="guests"
          />
        </div>
        <div className="">
          <input
            type="time"
            onChange={(e) => setTime(e.target.value)} // You can replace this with a state setter if needed
            className="w-min p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson focus:border-transparent transition-all"
            placeholder="Select time"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center p-3 bg-crimson text-white rounded-lg hover:bg-crimson transition-all focus:outline-none focus:ring-2 focus:ring-crimson focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* 2. Restaurant Types (multi-select) */}
        <div className="">
          <Select
            options={restaurantTypes}
            isMulti
            value={restaurantType}
            onChange={(vals) => setRestaurantType(vals as MultiValue[])}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select restaurant types..."
          />
        </div>
      </div>

      {/* Row for Distance, Max Results, and Preference */}
      <div className="flex flex-col justify-between md:flex-row w-1/2 gap-4">
        {/* 3. Distance (number input) */}
        <div className="">
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (meters)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            min={1}
            step={100}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson focus:border-transparent transition-all"
          />
        </div>

        {/* Max Results */}
        <div className="">
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Results</label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson focus:border-transparent transition-all"
          />
        </div>

        {/* 4. Rank Preference (single select) */}
        <div className="">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preference</label>
          <select
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson focus:border-transparent transition-all"
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