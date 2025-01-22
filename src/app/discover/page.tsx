import React from 'react';
import SearchBar from '@/components/form/searchbar';

const DiscoverPage = () => {
    return (
        <div className="discover-page">
            <h1>Discover</h1>
            <SearchBar />
            {/* Additional content can go here */}
            <div className="content">
                {/* ... existing content ... */}
            </div>
        </div>
    );
};

export default DiscoverPage;
