import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import AuthModal from '../components/features/AuthModal';
import Loading from '../components/common/Loading';
import { cartAPI, authAPI } from '../utils/api';
import '../styles/pages/Cart.css';
import { getImageUrl } from '../utils/imageUtils';
import { formatCurrency } from '../utils/helpers';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [postLoginAction, setPostLoginAction] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserLoggedIn(true);
        setCurrentUser(user);
        fetchCart(user.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserLoggedIn(false);
        setCurrentUser(null);
        setModalOpen(true);
      }
    } else {
      setUserLoggedIn(false);
      setCurrentUser(null);
      setModalOpen(true);
    }
  }, []);

  const fetchCart = async (userId) => {
    try {
      const response = await cartAPI.get(userId);

      if (Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        console.error("Invalid cart data format:", response.data);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    try {
      await cartAPI.update(currentUser.id, cartItemId, { quantity });
      fetchCart(currentUser.id);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity. Please try again.');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartAPI.remove(currentUser.id, cartItemId);
      fetchCart(currentUser.id);
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Error removing item from cart. Please try again.');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear(currentUser.id);
      setCartItems([]);
      alert('Cart cleared successfully!');
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error clearing cart. Please try again.');
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);

    const shipping = 0; // Always Free Shipping

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: (subtotal + shipping).toFixed(2)
    };
  };

  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const invalidItems = cartItems.filter(item => !item.product);
    if (invalidItems.length > 0) {
      alert("Some items in your cart are invalid. Please remove them and try again.");
      return;
    }

    navigate('/checkout', {
      state: {
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          cartItemId: item.id
        }))
      }
    });
  };

  const handleLogin = (userData) => {
    setUserLoggedIn(true);
    setCurrentUser(userData);
    setModalOpen(false);
    fetchCart(userData.id);

    if (postLoginAction === "wishlist") {
      navigate("/wishlist");
    } else if (postLoginAction === "cart") {
      // Already on cart page
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUserLoggedIn(false);
      setCurrentUser(null);
      setCartItems([]);
      localStorage.removeItem("user");
      alert("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleWishlistClick = () => {
    if (!userLoggedIn) {
      setPostLoginAction("wishlist");
      setModalOpen(true);
    } else {
      navigate("/wishlist");
    }
  };

  const handleCartClick = () => {
    if (!userLoggedIn) {
      setPostLoginAction("cart");
      setModalOpen(true);
    } else {
      navigate("/cart");
    }
  };

  const totals = calculateTotal();

  if (loading) {
    return (
      <div className="cart-page">
        <Header
          userLoggedIn={userLoggedIn}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onLogout={handleLogout}
          onLoginClick={() => setModalOpen(true)}
          onWishlistClick={handleWishlistClick}
          onCartClick={handleCartClick}
          cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        />
        <Loading message="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Header
        userLoggedIn={userLoggedIn}
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onLogout={handleLogout}
        onLoginClick={() => setModalOpen(true)}
        onWishlistClick={handleWishlistClick}
        onCartClick={handleCartClick}
        cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {modalOpen && (
        <AuthModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onLoginSuccess={handleLogin}
          defaultAction={postLoginAction}
        />
      )}

      <div className="cart-container">
        <div className="cart-content">
          <div className="cart-items-section">
            <div className="section-header">
              <h2>Your Shopping Cart ({cartItems.length} items)</h2>
              {cartItems.length > 0 && (
                <button className="clear-cart-btn" onClick={clearCart}>
                  Clear Cart
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p className="empty-cart-subtitle">Looks like you haven't added anything to your cart yet.</p>
                <button
                  className="continue-shopping-btn"
                  onClick={() => navigate('/products')}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map(item => {
                  const imageUrl = item.product ? getImageUrl(item.product.images?.length > 0 ? item.product.images[0] : item.product.image) : '';

                  const handleItemClick = () => {
                    if (item.product?.id) {
                      navigate(`/product/${item.product.id}`);
                    }
                  };

                  return (
                    <div
                      key={item.id}
                      className="cart-item-card"
                      onClick={handleItemClick}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="item-image-wrapper">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product?.name}
                            className="item-image"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="item-image-placeholder">No Image</div>
                        )}
                      </div>

                      <div className="item-content">
                        <div className="item-main-info">
                          <h3 className="cart-item-title">
                            {item.product ? item.product.name : 'Unavailable Product'}
                          </h3>
                          <div className="cart-item-meta">
                            {item.product && <span className="item-price-tag">{formatCurrency(item.product.price)}</span>}
                            {item.selectedSize && <span className="item-size-badge">Size: {item.selectedSize}</span>}
                          </div>
                        </div>

                        <div className="item-controls-row">
                          <div className="quantity-pill" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity - 1);
                              }}
                              disabled={item.quantity <= 1}
                            >-</button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                            >+</button>
                          </div>

                          <div className="item-row-total">
                            {item.product && formatCurrency(item.product.price * item.quantity)}
                          </div>

                          <button
                            className="remove-item-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(item.id);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="order-summary">
              <h3>Order Summary</h3>

              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <span className="summary-item-name">
                      {item.product ? item.product.name : 'Unknown Product'} x {item.quantity}
                    </span>
                    <span className="summary-item-price">
                      ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal}</span>
              </div>

              <div className="summary-row">
                <span>Delivery Charge:</span>
                <span className="free-shipping">₹0</span>
              </div>

              <div className="summary-row">
                <span>GST (0%):</span>
                <span>₹0</span>
              </div>

              <div className="summary-row">
                <span>CGST (0%):</span>
                <span>₹0</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{totals.total}</span>
              </div>

              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;