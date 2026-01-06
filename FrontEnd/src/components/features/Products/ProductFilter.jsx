import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaTimes, FaCheck } from 'react-icons/fa';

const ProductFilter = ({
    showFilters,
    priceRange,
    selectedPriceRange,
    setSelectedPriceRange,
    ratingFilter,
    setRatingFilter,
    applyFilters,
    clearFilters,
    ratingOptions
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const filterRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!showFilters) return null;

    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    return (
        <div className="horizontal-filters" ref={filterRef}>
            <div className="filter-group">
                {/* Price Filter */}
                <div className="filter-item">
                    <button
                        className={`filter-btn ${activeDropdown === 'price' ? 'active' : ''}`}
                        onClick={() => toggleDropdown('price')}
                    >
                        Price Range
                        <FaChevronDown className={`chevron ${activeDropdown === 'price' ? 'rotate' : ''}`} />
                    </button>

                    {activeDropdown === 'price' && (
                        <div className="filter-dropdown price-dropdown">
                            <div className="price-range-inputs">
                                <div className="range-group">
                                    <label>Min Price</label>
                                    <div className="input-wrapper">
                                        <span>₹</span>
                                        <input
                                            type="number"
                                            value={selectedPriceRange.min}
                                            onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                            min={priceRange.min}
                                            max={selectedPriceRange.max}
                                        />
                                    </div>
                                </div>
                                <div className="range-separator">-</div>
                                <div className="range-group">
                                    <label>Max Price</label>
                                    <div className="input-wrapper">
                                        <span>₹</span>
                                        <input
                                            type="number"
                                            value={selectedPriceRange.max}
                                            onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                                            min={selectedPriceRange.min}
                                            max={priceRange.max}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="range-slider">
                                <input
                                    type="range"
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    value={selectedPriceRange.min}
                                    onChange={(e) => {
                                        const val = Math.min(parseInt(e.target.value), selectedPriceRange.max - 100);
                                        setSelectedPriceRange(prev => ({ ...prev, min: val }));
                                    }}
                                    className="thumb thumb-left"
                                />
                                <input
                                    type="range"
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    value={selectedPriceRange.max}
                                    onChange={(e) => {
                                        const val = Math.max(parseInt(e.target.value), selectedPriceRange.min + 100);
                                        setSelectedPriceRange(prev => ({ ...prev, max: val }));
                                    }}
                                    className="thumb thumb-right"
                                />
                                <div className="slider-track">
                                    <div
                                        className="slider-range"
                                        style={{
                                            left: `${((selectedPriceRange.min - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                                            width: `${((selectedPriceRange.max - selectedPriceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating Filter */}
                <div className="filter-item">
                    <button
                        className={`filter-btn ${activeDropdown === 'rating' ? 'active' : ''}`}
                        onClick={() => toggleDropdown('rating')}
                    >
                        Rating
                        <FaChevronDown className={`chevron ${activeDropdown === 'rating' ? 'rotate' : ''}`} />
                    </button>

                    {activeDropdown === 'rating' && (
                        <div className="filter-dropdown rating-dropdown">
                            {ratingOptions.map((option) => (
                                <label key={option.value} className="rating-option-item">
                                    <input
                                        type="radio"
                                        name="rating"
                                        checked={ratingFilter === option.value}
                                        onChange={() => setRatingFilter(option.value)}
                                    />
                                    <div className="rating-content">
                                        <span className="stars">{'★'.repeat(option.value)}</span>
                                        <span className="rating-text">& Up</span>
                                    </div>
                                    {ratingFilter === option.value && <FaCheck className="check-icon" />}
                                </label>
                            ))}
                            <label className="rating-option-item">
                                <input
                                    type="radio"
                                    name="rating"
                                    checked={ratingFilter === 0}
                                    onChange={() => setRatingFilter(0)}
                                />
                                <div className="rating-content">
                                    <span className="rating-text">All Ratings</span>
                                </div>
                                {ratingFilter === 0 && <FaCheck className="check-icon" />}
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div className="filter-actions-horizontal">
                <button className="btn-apply" onClick={applyFilters}>
                    Apply
                </button>
                <button className="btn-clear" onClick={clearFilters}>
                    Clear All
                </button>
            </div>
        </div>
    );
};

export default ProductFilter;
