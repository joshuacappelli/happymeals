"use client";

import React, { createContext, useState, ReactNode } from "react";

interface ISearchContext {
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
}

// Default (fallback) values are not typically used in real code
// but TypeScript requires an initial shape.
export const SearchContext = createContext<ISearchContext>({
  address: "",
  setAddress: () => {},
});

// Provider component
export function SearchProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState("");

  return (
    <SearchContext.Provider value={{ address, setAddress }}>
      {children}
    </SearchContext.Provider>
  );
}
