"use client";

import React from 'react';
import { SearchBar2 } from '@/components/form/searchbar';
import { SearchContext } from '@/app/context/searchcontext';
import { useContext } from 'react';

const DiscoverPage = () => {
    const { address } = useContext(SearchContext);
    return (
        <div className="discover-page">
            <h1>Discover</h1>
            <p>You searched for: {address}</p>
            <SearchBar2 />
            <div className="content">
                {/* ... existing content ... */}
            </div>
        </div>
    );
};

export default DiscoverPage;
