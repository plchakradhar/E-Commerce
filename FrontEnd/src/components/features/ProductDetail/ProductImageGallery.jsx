import React, { useState, useRef } from 'react';
import { FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight, FaImage, FaPlay } from 'react-icons/fa';
import { getImageUrl, getFileType } from '../../../utils/imageUtils';

const ProductImageGallery = ({ product, wishlisted, toggleWishlist }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const mainImageRef = useRef(null);

    const handleImageError = (e) => {
        console.error('ProductDetail Media Error:', {
            src: e.target.src,
            productId: product?.id,
            productName: product?.name,
            imageIndex: currentImageIndex
        });

        setImageError(true);
        setImageLoaded(false);

        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            e.target.style.display = 'none';
        }

        const placeholder = e.target.parentNode.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
    };

    const handleImageLoad = (e) => {
        console.log('ProductDetail Media Loaded:', {
            src: e.target.src,
            productId: product?.id,
            productName: product?.name
        });

        setImageLoaded(true);
        setImageError(false);

        const placeholder = e.target.parentNode.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            e.target.style.display = 'block';
            e.target.style.opacity = '1';
        }
    };

    const preloadImage = (url) => {
        if (!url) return;

        const img = new Image();
        img.src = url;
        img.onload = () => {
            console.log('Image preloaded:', url);
        };
        img.onerror = () => {
            console.error('Failed to preload image:', url);
        };
    };

    const renderMainMedia = () => {
        if (!product.images || product.images.length === 0 || imageError) {
            return (
                <div className="image-placeholder">
                    <FaImage />
                    <span>No media available</span>
                </div>
            );
        }

        const currentMedia = product.images[currentImageIndex];
        const mediaUrl = getImageUrl(currentMedia);
        const fileType = getFileType(currentMedia);

        // Preload the image
        if (fileType === 'image' && mediaUrl) {
            preloadImage(mediaUrl);
        }

        if (fileType === 'video') {
            return (
                <div className="video-container">
                    <video
                        src={mediaUrl}
                        className="product-video"
                        controls
                        muted
                        playsInline
                        onError={handleImageError}
                        onLoadedData={handleImageLoad}
                        style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                        ref={mainImageRef}
                    />
                    <div className="video-badge">
                        <FaPlay /> Video
                    </div>
                    {!imageLoaded && !imageError && (
                        <div className="image-placeholder" style={{ display: 'flex' }}>
                            <FaImage />
                            <span>Loading video...</span>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <>
                    <img
                        src={mediaUrl}
                        alt={product.name}
                        className={`product-image ${imageLoaded ? 'loaded' : 'loading'}`}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        style={{
                            opacity: imageLoaded ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out'
                        }}
                        ref={mainImageRef}
                    />
                    {!imageLoaded && !imageError && (
                        <div className="image-placeholder" style={{ display: 'flex' }}>
                            <FaImage />
                            <span>Loading image...</span>
                        </div>
                    )}
                </>
            );
        }
    };

    const renderThumbnail = (image, index) => {
        const mediaUrl = getImageUrl(image);
        const fileType = getFileType(image);

        return (
            <button
                key={index}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''} ${fileType === 'video' ? 'video-thumbnail' : ''}`}
                onClick={() => {
                    setCurrentImageIndex(index);
                    setImageLoaded(false);
                    setImageError(false);
                }}
            >
                {fileType === 'video' ? (
                    <div className="video-thumbnail-container">
                        <video
                            src={mediaUrl}
                            muted
                            playsInline
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.className = 'thumbnail-placeholder';
                                placeholder.innerHTML = '<FaPlay />';
                                e.target.parentNode.appendChild(placeholder);
                            }}
                        />
                        <div className="video-thumbnail-overlay">
                            <FaPlay />
                        </div>
                    </div>
                ) : (
                    <img
                        src={mediaUrl}
                        alt={`${product.name} view ${index + 1}`}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = document.createElement('div');
                            placeholder.className = 'thumbnail-placeholder';
                            placeholder.textContent = 'Img';
                            e.target.parentNode.appendChild(placeholder);
                        }}
                    />
                )}
            </button>
        );
    };

    return (
        <div className="product-gallery">
            <div className="main-image-container">
                {renderMainMedia()}

                {product.images && product.images.length > 1 && (
                    <>
                        <button
                            className="nav-btn prev-btn"
                            onClick={() => {
                                setCurrentImageIndex(i => i === 0 ? product.images.length - 1 : i - 1);
                                setImageLoaded(false);
                            }}
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            className="nav-btn next-btn"
                            onClick={() => {
                                setCurrentImageIndex(i => (i + 1) % product.images.length);
                                setImageLoaded(false);
                            }}
                        >
                            <FaChevronRight />
                        </button>
                    </>
                )}

                <button
                    className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
                    onClick={toggleWishlist}
                >
                    {wishlisted ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            {product.images && product.images.length > 1 && (
                <div className="thumbnails">
                    {product.images.map((image, index) => renderThumbnail(image, index))}
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;
