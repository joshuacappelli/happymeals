"use client";

import React from "react";
import getCoordinates from "@/app/lib/geocoding";
import { useState } from "react";


const SearchBar: React.FC = () => {
  const [address, setAddress] = useState("");
  return (
    <div className="p-4 rounded-lg flex items-center gap-3 w-96">
      <input
        type="text"
        placeholder="Search..."
        className="border rounded p-2"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button 
      onClick={() => getCoordinates(address)}
      className="bg-gray-300 text-white p-2 rounded-full hover:bg-gray-400 transition-colors duration-300 focus:ring-2 focus:ring-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;