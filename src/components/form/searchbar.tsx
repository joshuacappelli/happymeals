"use client";

import React, { useContext, useState } from "react";
import getCoordinates from "@/app/lib/geocoding";
import { SearchContext } from "@/app/context/searchcontext";
import { useRouter } from "next/navigation";

const SearchBar: React.FC = () => {
  const router = useRouter();

  const [localAddress, setLocalAddress] = useState("");
  const { setAddress } = useContext(SearchContext);

  const handleSearch = () => {
    setAddress(localAddress);
  
    router.push(`/discover`);
  }


  return (
    <div className="p-4 rounded-lg flex items-center gap-3 w-96">
      <input
        type="text"
        placeholder="Search..."
        className="border rounded p-2"
        value={localAddress}
        onChange={(e) => setLocalAddress(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <button 
      onClick={() => {
        handleSearch();
      }}
      className="bg-gray-300 text-white p-2 rounded-full hover:bg-gray-400 transition-colors duration-300 focus:ring-2 focus:ring-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
};

interface SearchBar2Props {
  onsearch: (address: string) => void;
}

const SearchBar2: React.FC<SearchBar2Props> = ({ onsearch }) => {
  const { address, setAddress } = useContext(SearchContext);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    setAddress(searchTerm);
    onsearch(searchTerm);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <input
        type="text"
        placeholder={` ${address}`}
        className="border border-gray-300 p-3 w-80 shadow-md focus:outline-none focus:ring-2 focus:ring-crimson transition duration-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <button 
        onClick={handleSearch}
        className="ml-2 bg-crimson text-white p-3 hover:bg-crimson/90 transition duration-300 focus:ring-2 focus:ring-crimson-300">
        Search
      </button>
    </div>
  );
};

export { SearchBar, SearchBar2 };
