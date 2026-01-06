import React from 'react';
import { FaShoppingCart, FaPlus, FaMinus, FaTruck, FaUndo, FaShieldAlt } from 'react-icons/fa';
import StarRating from '../../common/StarRating';

const ProductInfo = ({
    product,
    selectedSize,
    setSelectedSize,
    quantity,
    setQuantity,
    addToCart,
    buyNow,
    addingToCart
}) => {
    const discountPercentage = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="product-info-container">
            <div className="detail-header">
                <span className="detail-brand">{product.brand || 'MASCLE'}</span>
                <h1 className="detail-title">{product.name || 'Product Name'}</h1>

                <div className="detail-rating">
                    <div className="stars">
                        <StarRating rating={product.rating || 4.5} />
                    </div>
                    {/* <span className="rating-text">({product.reviewCount || 124} reviews)</span> */}
                </div>
            </div>

            <div className="detail-pricing">
                <span className="detail-current-price">₹{product.price?.toLocaleString() || '0'}</span>
                {product.originalPrice > product.price && (
                    <>
                        <span className="detail-original-price">₹{product.originalPrice?.toLocaleString()}</span>
                        <span className="detail-discount-badge">{discountPercentage}% OFF</span>
                    </>
                )}
            </div>
            <div className="tax-info">Inclusive of all taxes</div>

            {product.sizes && product.sizes.length > 0 && (
                <div className="size-section">
                    <div className="section-header">
                        <h3>Select Size</h3>
                        <span className="size-guide">Size Guide</span>
                    </div>
                    <div className="size-options">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="action-section">
                <div className="quantity-selector">
                    <span className="quantity-label">Quantity:</span>
                    <div className="quantity-controls">
                        <button
                            className="qty-btn"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                        >
                            <FaMinus />
                        </button>
                        <span className="quantity">{quantity}</span>
                        <button
                            className="qty-btn"
                            onClick={() => setQuantity(q => Math.min(10, q + 1))}
                            disabled={quantity >= 10}
                        >
                            <FaPlus />
                        </button>
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        className="btn-action add-to-cart"
                        onClick={addToCart}
                        disabled={addingToCart || (product.sizes?.length > 0 && !selectedSize) || product.stock === 0}
                    >
                        <FaShoppingCart />
                        {addingToCart ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                        className="btn-action buy-now"
                        onClick={buyNow}
                        disabled={product.sizes?.length > 0 && !selectedSize || product.stock === 0}
                    >
                        Buy Now
                    </button>
                </div>
            </div>

            {/* <div className="trust-badges">
                <div className="trust-item">
                    <FaTruck />
                    <span>Free Delivery</span>
                </div>
                <div className="trust-item">
                    <FaUndo />
                    <span>30 Days Return</span>
                </div>
                <div className="trust-item">
                    <FaShieldAlt />
                    <span>1 Year Warranty</span>
                </div>
            </div> */}
        </div>
    );
};

export default ProductInfo;
