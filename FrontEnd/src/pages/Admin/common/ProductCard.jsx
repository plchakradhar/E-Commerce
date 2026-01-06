// src/Admin/common/ProductCard.jsx - COMPLETE FIXED VERSION
import React from "react";
import { FaEdit, FaTrash, FaImage } from "react-icons/fa";
import { getImageUrl } from "../../../utils/imageUtils";

const ProductCard = ({ product, onEdit, onDelete }) => {
  // Function to handle image errors
  const handleImageError = (e) => {
    console.error('Admin ProductCard Image Error:', {
      src: e.target.src,
      productId: product.id,
      productName: product.name,
      originalImagePath: product.images?.[0]
    });
    e.target.style.display = 'none';
    const placeholder = e.target.nextSibling;
    if (placeholder && placeholder.classList.contains('placeholder-image')) {
      placeholder.style.display = 'flex';
    }
  };

  const handleImageLoad = (e) => {
    console.log('Admin ProductCard Image Loaded:', {
      src: e.target.src,
      productId: product.id,
      productName: product.name
    });
    e.target.style.display = 'block';
    const placeholder = e.target.nextSibling;
    if (placeholder && placeholder.classList.contains('placeholder-image')) {
      placeholder.style.display = 'none';
    }
  };

  const mainImage = product.images?.[0] ? getImageUrl(product.images[0]) : null;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  console.log('Admin ProductCard:', {
    productId: product.id,
    productName: product.name,
    mainImage: mainImage,
    originalPath: product.images?.[0]
  });

  return (
    <div className="product-card">
      <div className="product-image">
        {mainImage ? (
          <>
            <img
              src={mainImage}
              alt={product.name}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              style={{ display: 'block', width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div className="placeholder-image" style={{ display: 'none' }}>
              <FaImage className="placeholder-icon" />
              <span>No Image Available</span>
            </div>
          </>
        ) : (
          <div className="placeholder-image">
            <FaImage className="placeholder-icon" />
            <span>No Image</span>
          </div>
        )}
        {hasDiscount && (
          <div className="discount-badge">-{discountPercentage}%</div>
        )}
        {product.assured && (
          <div className="assured-badge">Assured</div>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="category">{product.category}</p>
        <div className="price-section">
          <span className="price">₹{product.price}</span>
          {hasDiscount && (
            <span className="original-price">₹{product.originalPrice}</span>
          )}
        </div>
        <p className={`stock ${product.stock <= 10 ? 'low-stock' : ''}`}>
          Stock: {product.stock}
        </p>
        <p className="brand">{product.brand}</p>
        {product.material && (
          <p className="material">Material: {product.material}</p>
        )}
      </div>

      <div className="product-actions">
        <button className="action-btn edit" onClick={() => onEdit(product)}>
          <FaEdit />
        </button>
        <button className="action-btn delete" onClick={() => onDelete(product.id)}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;