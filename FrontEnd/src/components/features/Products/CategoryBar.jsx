import React from 'react';

const CategoryBar = ({ categories, selectedCategory, handleCategorySelect }) => {
    return (
        <div className="categories-bar">
            {categories.map((category) => (
                <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategoryBar;
