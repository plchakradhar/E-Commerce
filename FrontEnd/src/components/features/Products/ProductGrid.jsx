import React from 'react';
import ProductCard from '../ProductCard';
import Loading from '../../common/Loading';
import { FaSearch, FaTimes } from 'react-icons/fa';

const ProductGrid = ({
    products,
    loading,
    wishlistItems,
    handleWishlistClick,
    handleClearSearch,
    activeFilters,
    clearActiveFilter
}) => {
    if (loading) {
        return <Loading message="Loading products..." />;
    }

    if (products.length === 0) {
        return (
            <div className="no-products">
                <div className="no-products-icon">
                    <FaSearch />
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search term or browse different categories</p>
                <button
                    className="cta-button"
                    onClick={handleClearSearch}
                >
                    Browse All Products
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Active Filters */}
            {activeFilters && (activeFilters.price || activeFilters.rating) && (
                <div className="active-filters">
                    <span>Active Filters:</span>
                    {activeFilters.price && (
                        <span className="filter-tag">
                            Price: ₹{activeFilters.price.min} - ₹{activeFilters.price.max}
                            <button onClick={() => clearActiveFilter('price')}>
                                <FaTimes />
                            </button>
                        </span>
                    )}
                    {activeFilters.rating && (
                        <span className="filter-tag">
                            Rating: {activeFilters.rating}★ & above
                            <button onClick={() => clearActiveFilter('rating')}>
                                <FaTimes />
                            </button>
                        </span>
                    )}
                </div>
            )}

            <div className="products-grid">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onWishlistClick={handleWishlistClick}
                        isWishlisted={wishlistItems.has(product.id)}
                        showWishlist={true}
                    />
                ))}
            </div>
        </>
    );
};

export default ProductGrid;
