import React from 'react';

const ProductHeader = ({
    searchQuery,
    selectedCategory,
    sortOption,
    setSortOption
}) => {
    return (
        <div className="products-header">
            <div className="header-info">
                <h1>
                    {searchQuery ? `Search: "${searchQuery}"` : selectedCategory}
                </h1>
                {searchQuery && (
                    <p className="search-info">
                        Results for "{searchQuery}"
                    </p>
                )}
            </div>

            <div className="header-actions">
                <div className="sort-options">
                    <label>Sort by:</label>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="sort-select"
                    >
                        <option value="default">Recommended</option>
                        <option value="newest">Newest First</option>
                        <option value="priceLowHigh">Price: Low to High</option>
                        <option value="priceHighLow">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                        <option value="discount">Best Discount</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ProductHeader;
