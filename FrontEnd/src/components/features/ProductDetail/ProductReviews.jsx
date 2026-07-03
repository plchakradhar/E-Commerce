import React from 'react';
import StarRating from '../../common/StarRating';

const ProductReviews = ({ reviews }) => {
    return (
        <section className="reviews-section">
            <div className="container">
                <h2 className="section-title">Customer Reviews ({reviews.length})</h2>
                <div className="reviews-content">
                    {reviews.length === 0 ? (
                        <div className="no-reviews">
                            <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="reviews-grid">
                            {reviews.slice(0, 4).map((review) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <div className="avatar">
                                                {review.user?.fullName?.charAt(0) ||
                                                    review.user?.username?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h4>{review.user?.fullName || review.user?.username || 'Anonymous'}</h4>
                                                <div className="review-stars">
                                                    <StarRating rating={review.rating} />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="review-comment">{review.comment}</p>
                                    )}
                                    {review.images && review.images.length > 0 && (
                                        <div className="review-images">
                                            {review.images.map((img, idx) => (
                                                <div key={idx} className="review-image-thumbnail">
                                                    <img src={`http://localhost:8085${img}`} alt={`Review ${idx}`} onError={(e) => e.target.style.display = 'none'} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductReviews;
