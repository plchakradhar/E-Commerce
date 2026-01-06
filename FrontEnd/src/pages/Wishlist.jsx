import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { wishlistAPI, authAPI, cartAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";
import { FaHeart, FaTrash, FaSpinner, FaPlus, FaPlay } from "react-icons/fa";
import "../styles/pages/Wishlist.css";
import "../styles/pages/Products.css"; // Ensure we inherit badge styles

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = () => {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.id) {
                        setCurrentUser(user);
                        return;
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("User Parse Error:", error);
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (currentUser && currentUser.id) {
            fetchWishlist(currentUser.id);
        }
    }, [currentUser]);

    const fetchWishlist = async (userId) => {
        setLoading(true);
        try {
            const response = await wishlistAPI.get(userId);
            setWishlistItems(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Fetch Wishlist Error:", error);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (e, productId) => {
        e.stopPropagation();
        if (!currentUser) return;

        const prevItems = [...wishlistItems];
        setWishlistItems(prev => prev.filter(item => item.id !== productId));

        try {
            await wishlistAPI.remove(currentUser.id, productId);
        } catch (error) {
            console.error("Remove Error:", error);
            setWishlistItems(prevItems);
            alert("Failed to remove item.");
        }
    };

    const handleAddToCart = async (e, item) => {
        e.stopPropagation();
        if (!currentUser) {
            navigate("/login");
            return;
        }

        setAddingToCart(prev => ({ ...prev, [item.id]: true }));
        try {
            // Robust Product ID extraction
            const targetProductId = item.product?.id || item.productId || item.id;

            if (!targetProductId) {
                console.error("No Product ID found", item);
                alert("Cannot add invalid item to cart.");
                return;
            }

            const productToAdd = {
                userId: currentUser.id,
                productId: targetProductId,
                quantity: 1,
                selectedSize: item.selectedSize || "M"
            };

            await cartAPI.add(productToAdd);

            // Success (Spinner will stop, indicating success)

        } catch (error) {
            console.error("Add to Cart Error:", error);
            alert("Could not add to cart. Please try again.");
        } finally {
            setAddingToCart(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const handleProductClick = (productId) => {
        if (productId) navigate(`/product/${productId}`);
    };

    const handleLogout = async () => {
        await authAPI.logout();
        localStorage.removeItem("user");
        setCurrentUser(null);
        navigate("/");
    };

    if (loading) {
        return (
            <div className="wishlist-page-wrapper white-theme">
                <Header userLoggedIn={!!currentUser} currentUser={currentUser} />
                <div className="wishlist-loader">
                    <FaSpinner className="spinner-icon fa-spin" style={{ fontSize: '32px' }} />
                    <p>Loading your favorites...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="wishlist-page-wrapper white-theme">
            <Header
                userLoggedIn={!!currentUser}
                currentUser={currentUser}
                onLogout={handleLogout}
                onLoginClick={() => navigate("/login")}
                onCartClick={() => navigate("/cart")}
            />

            <div className="wishlist-container">
                <div className="wishlist-header">
                    <h2>My Wishlist <span className="item-count">{wishlistItems.length}</span></h2>
                </div>

                {!currentUser ? (
                    <div className="empty-wishlist-state">
                        <div className="empty-icon-box"><FaHeart /></div>
                        <h3>Please Log In</h3>
                        <p>Login to view your saved items.</p>
                        <button className="add-to-cart-btn home-btn" onClick={() => navigate('/')}>
                            Go Home
                        </button>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="empty-wishlist-state">
                        <div className="empty-icon-box"><FaHeart /></div>
                        <h3>Your wishlist is empty</h3>
                        <p>Looks like you haven't added anything to your wishlist yet.</p>
                        <button className="add-to-cart-btn home-btn" onClick={() => navigate('/products')}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlistItems.map((item) => {
                            const imageUrl = getImageUrl(item.image || (item.product?.images && item.product.images[0]) || (item.images && item.images[0]));
                            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
                            const originalPrice = item.originalPrice ? Number(item.originalPrice) : null;
                            const hasDiscount = originalPrice && originalPrice > price;
                            const discountPercentage = hasDiscount
                                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                                : 0;
                            const stock = item.stock || 0;
                            const isOutOfStock = stock === 0;

                            // Ensure we link to the correct ID
                            const productLinkId = item.product?.id || item.productId || item.id;

                            return (
                                <div
                                    key={item.id || Math.random()}
                                    className="wishlist-card"
                                    onClick={() => handleProductClick(productLinkId)}
                                >
                                    <div className="wishlist-image-container">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                                        ) : (
                                            <div className="no-image-placeholder">No Image</div>
                                        )}

                                        {/* Matches ProductCard Badges */}
                                        <div className="product-badges">
                                            {item.mediaType === 'video' && (
                                                <div className="badge video-badge">
                                                    <FaPlay /> Video
                                                </div>
                                            )}
                                            {hasDiscount && (
                                                <div className="badge discount-badge">-{discountPercentage}%</div>
                                            )}
                                            {item.isNew && <div className="badge new-badge">New</div>}
                                            {stock <= 10 && stock > 0 && (
                                                <div className="badge low-stock-badge">Low Stock</div>
                                            )}
                                            {isOutOfStock && (
                                                <div className="badge out-of-stock-badge">Out of Stock</div>
                                            )}
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={(e) => handleRemoveFromWishlist(e, item.id)}
                                            title="Remove from Wishlist"
                                        >
                                            <FaTrash />
                                        </button>

                                        {/* Quick Add Button logic */}
                                        {!isOutOfStock && (
                                            <button
                                                className="quick-add-btn"
                                                onClick={(e) => handleAddToCart(e, item)}
                                                disabled={addingToCart[item.id]}
                                            >
                                                {addingToCart[item.id] ? <FaSpinner className="fa-spin" /> : <><FaPlus /> Quick Add</>}
                                            </button>
                                        )}
                                    </div>

                                    <div className="wishlist-card-content">
                                        <div className="product-brand">{item.brand || (item.category || "Mascle")}</div>
                                        <h3 className="product-title" title={item.productName || item.name}>
                                            {item.productName || item.name || "Unknown Product"}
                                        </h3>

                                        <p className="product-category-text">
                                            {item.category || 'Uncategorized'}
                                        </p>

                                        <div className="product-pricing">
                                            <span className="current-price">₹{price.toLocaleString()}</span>
                                            {hasDiscount && (
                                                <span className="original-price">₹{originalPrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Wishlist;
