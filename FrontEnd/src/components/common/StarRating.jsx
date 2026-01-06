import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, maxStars = 5, interactive = false, onRate = null }) => {
    const stars = [];
    const numericRating = parseFloat(rating) || 0;

    for (let i = 1; i <= maxStars; i++) {
        const isFilled = i <= Math.floor(numericRating);
        const isHalf = !isFilled && i - 0.5 <= numericRating;

        const StarIcon = isFilled ? FaStar : isHalf ? FaStarHalfAlt : FaRegStar;
        const className = `star ${isFilled || isHalf ? 'filled' : ''} ${interactive ? 'interactive' : ''}`;

        stars.push(
            <StarIcon
                key={i}
                className={className}
                onClick={() => interactive && onRate && onRate(i)}
                style={interactive ? { cursor: 'pointer' } : {}}
            />
        );
    }

    return <>{stars}</>;
};

export default StarRating;
