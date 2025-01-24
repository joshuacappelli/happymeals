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

  // setting how many results to return
  const [maxResults, setMaxResults] = useState<number>(10);
  
  // For multi-select restaurant types
  const [restaurantType, setRestaurantType] = useState<MultiValue[]>([]);

  // For distance (default 500m)
  const [distance, setDistance] = useState<number>(500);

  // For preference (MUST be a valid v1 value, like "BEST", "DISTANCE", or "RANK_PREFERENCE_UNSPECIFIED")
  const [preference, setPreference] = useState<string>("BEST");

  // “Search” button handler
  const handleSearch = () => {
    // Convert the MultiValue[] to a string[] of the .value
    const primaryTypes = restaurantType.map((item) => item.value);

    // Send these up to the parent
    onSearch(maxResults, distance, primaryTypes, preference);
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
      <h2>Find Places</h2>

      {/* 1. Address / Keyword input */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Address / Keyword:</label>
        <input
          type="text"
          placeholder="e.g. 123 Main St or 'Seafood'"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* 2. Restaurant Types (multi-select) */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Restaurant Types (Multi-select):</label>
        <Select
          options={restaurantTypes}
          isMulti
          value={restaurantType}
          onChange={(vals) => setRestaurantType(vals as MultiValue[])}
        />
      </div>

      {/* 3. Distance (number input) */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Distance (meters):</label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          min={1}
          step={100}
        />
      </div>

      {/* 4. Rank Preference (single select) */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Preference:</label>
        <select
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
        >
          {preferenceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 5. "Search" button */}
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default PlacesSelectionPanel;
