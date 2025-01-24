"use client"; // needed if you're in Next.js 13+ App Router with a client component

import React, { useContext, useState } from "react";
import { SearchContext } from "@/app/context/searchcontext";
import { useRouter } from "next/navigation";

interface PlacesSelectionPanelProps {
    onsearch: (address: string, maxresults: number, radius: number, primarytypes: string[], preference: string) => void;
}

const PlacesSelectionPanel: React.FC<PlacesSelectionPanelProps> = ({ onsearch }) => {
  const { address, setAddress } = useContext(SearchContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurantType, setRestaurantType] = useState("restaurant");
  const [distance, setDistance] = useState(500);
  const [preference, setPreference] = useState("BEST"); // Must be valid v1 value: BEST, DISTANCE, ...
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    setAddress(searchTerm);
    onsearch(address, 10, 500, ["restaurant"], "BEST");
  }
 
  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
      <h2>Find Places</h2>
      <div style={{ marginBottom: "1rem" }}>
        {/* 1. Choose Type of Restaurant */}
        <label style={{ marginRight: "0.5rem" }}>Type:</label>
        <select
          value={restaurantType}
          onChange={(e) => setRestaurantType(e.target.value)}
        >
          <option value="restaurant">Restaurant</option>
          <option value="cafe">Cafe</option>
          <option value="bar">Bar</option>
          {/* Add more as needed */}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {/* 2. Choose Distance */}
        <label style={{ marginRight: "0.5rem" }}>Distance (meters):</label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          min={1}
          step={100}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {/* 3. Choose rankPreference */}
        <label style={{ marginRight: "0.5rem" }}>Preference:</label>
        <select
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
        >
          <option value="BEST">Best</option>
          <option value="DISTANCE">Distance</option>
          <option value="RANK_PREFERENCE_UNSPECIFIED">Unspecified</option>
          {/* As allowed by the Google Places v1 docs */}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {/* 4. Optional text input (keyword) */}
        <label style={{ marginRight: "0.5rem" }}>Keyword / Place name:</label>
        <input
          type="text"
          placeholder="e.g., Seafood"
          value={keyword}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default PlacesSelectionPanel;
