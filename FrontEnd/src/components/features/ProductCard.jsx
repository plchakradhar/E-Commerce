import React, { useState, useEffect } from 'react';
import { FaHeart, FaShoppingBag, FaImage, FaPlay, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { getImageUrl, getFileType } from '../../utils/imageUtils';
import '../../styles/components/ProductCard.css';

const ProductCard = ({
  product,
  onWishlistClick,
  onAddToCart,
  isWishlisted = false,
  showWishlist = true
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [fileType, setFileType] = useState('image');

  useEffect(() => {
    if (product.images?.[0]) {
      const url = getImageUrl(product.images[0]);
      const type = getFileType(product.images[0]);
      setMediaUrl(url);
      setFileType(type);

      // Preload image
      if (type === 'image') {
        const img = new Image();
        img.src = url;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageError(true);
      }
    }
  }, [product.images]);

  const handleProductClick = () => navigate(`/product/${product.id}`);
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlistClick?.(product.id, e);
  };
  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const onMediaError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const onMediaLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const renderMedia = () => {
    if (!mediaUrl || imageError) {
      return (
        <div className="placeholder-image">
          <FaImage className="placeholder-icon" />
          <span>No Image</span>
        </div>
      );
    }

    if (fileType === 'video') {
      return (
        <div className="video-container">
          <video
            src={mediaUrl}
            className="product-media"
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={onMediaLoad}
            onError={onMediaError}
            onMouseOver={event => event.target.play()}
            onMouseOut={event => event.target.pause()}
          />
          <div className="video-overlay">
            <FaPlay className="play-icon" />
          </div>
        </div>
      );
    }

    return (
      <>
        <img
          src={mediaUrl}
          alt={product.name || 'Product'}
          className="product-media"
          loading="lazy"
          onLoad={onMediaLoad}
          onError={onMediaError}
        />
        {!imageLoaded && !imageError && (
          <div className="placeholder-image">
            <FaImage className="placeholder-icon" />
            <span>Loading...</span>
          </div>
        )}
      </>
    );
  };

  return (
    <motion.div
      className="product-card"
      onClick={handleProductClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* IMAGE SECTION */}
      <div className="product-image-container">
        <div className="product-image-wrapper">
          {renderMedia()}
        </div>

        {/* Badges */}
        <div className="product-badges">
          {fileType === 'video' && (
            <div className="badge video-badge">
              <FaPlay /> Video
            </div>
          )}
          {hasDiscount && (
            <div className="badge discount-badge">-{discountPercentage}%</div>
          )}
          {product.isNew && <div className="badge new-badge">New</div>}
          {product.stock <= 10 && product.stock > 0 && (
            <div className="badge low-stock-badge">Low Stock</div>
          )}
          {product.stock === 0 && (
            <div className="badge out-of-stock-badge">Out of Stock</div>
          )}
        </div>

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FaHeart />
          </button>
        )}

        {/* Quick Add Button */}
        {product.stock > 0 && (
          <button
            className="quick-add-btn"
            onClick={handleAddToCart}
          >
            <FaPlus /> Quick Add
          </button>
        )}
      </div>

      {/* PRODUCT INFO */}
      <div className="product-info">
        <div className="product-header">
          <h4 className="product-name" title={product.name}>
            {product.name || 'Unnamed Product'}
          </h4>
        </div>

        <p className="product-category">{product.category || 'Uncategorized'}</p>

        <div className="product-pricing">
          <span className="current-price">
            ₹{product.price?.toLocaleString() || '0'}
          </span>
          {hasDiscount && (
            <span className="original-price">
              ₹{product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;