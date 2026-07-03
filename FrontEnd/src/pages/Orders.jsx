import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import AuthModal from "../components/features/AuthModal";
import Loading from "../components/common/Loading";
import Footer from "../components/common/Footer";
import '../styles/pages/Orders.css';
import { FaSearch, FaFilter, FaBox, FaCheckCircle, FaTruck, FaUndo, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa';
import { orderAPI, authAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";
import { formatDate, formatCurrency, getOrderStatusStep, getStatusBadgeColor, getEstimatedDeliveryDate, formatExactDeliveryDate } from "../utils/helpers";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserLoggedIn(true);
        setCurrentUser(user);
        // Optimistic load: check if we have orders in memory/cache or just fetch fast
        fetchOrders(user.id);
      } catch (error) {
        setUserLoggedIn(false);
        setLoading(false);
      }
    } else {
      setUserLoggedIn(false);
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (userId) => {
    try {
      // Don't set loading true if we already have orders (prevents flash on re-focus if expanded later)
      // For now, simple fetch
      const response = await orderAPI.getByUser(userId);
      let fetchedOrders = Array.isArray(response.data) ? response.data : [];

      // Sort by date desc
      const sortedOrders = fetchedOrders.sort((a, b) =>
        new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate)
      );

      setOrders(sortedOrders);
    } catch (error) {
      // Silent fail or toast
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    navigate('/orderdetails', { state: { order } });
  };

  const handleLogin = (userData) => {
    setUserLoggedIn(true);
    setCurrentUser(userData);
    setModalOpen(false);
    fetchOrders(userData.id);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (e) { /* ignore */ }
    setUserLoggedIn(false);
    setCurrentUser(null);
    setOrders([]);
    localStorage.removeItem("user");
    navigate("/");
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = (order.id || order.orderId)?.toString().includes(q);
    const itemMatch = order.items?.some(item => item.productName.toLowerCase().includes(q));
    return idMatch || itemMatch;
  });

  if (loading) {
    return (
      <div className="orders-page-wrapper white-theme">
        <Header userLoggedIn={userLoggedIn} currentUser={currentUser} />
        <Loading message="Loading..." />
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper white-theme">
      <Header
        userLoggedIn={userLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setModalOpen(true)}
        onWishlistClick={() => navigate("/wishlist")}
        onCartClick={() => navigate("/cart")}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {modalOpen && (
        <AuthModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onLoginSuccess={handleLogin}
        />
      )}

      <div className="orders-main-content">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>

        <div className="orders-container">
          {/* Search Bar */}
          <div className="orders-search-filter-row">
            <div className="search-bar-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <FaFilter />
            </button>
          </div>

          {/* Orders List Container */}
          <div className="orders-list-container">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="empty-state-box"
                >
                  <div className="empty-icon"><FaBox /></div>
                  <h3>No orders yet</h3>
                  <p>Check out our collection and place your first order!</p>
                  <button className="shop-now-btn" onClick={() => navigate('/products')}>
                    Start Shopping
                  </button>
                </motion.div>
              ) : (
                filteredOrders.map((order) => {
                  /* Data prep */
                  const firstItem = order.items?.[0] || {};
                  const imageUrl = getImageUrl(firstItem.image || firstItem.images?.[0]);
                  const step = getOrderStatusStep(order.status);
                  const isCancelled = order.status?.toLowerCase() === 'cancelled';
                  const totalItems = order.items?.length || 0;

                  // Helper for Status Icon (Preserved)
                  const getStatusIcon = (status) => {
                    const s = status?.toLowerCase();
                    if (s === 'delivered') return <FaCheckCircle />;
                    if (s === 'cancelled') return <FaTimesCircle />;
                    if (s === 'out_for_delivery') return <FaTruck />; // Specific icon for Out
                    if (s === 'shipped' || s === 'processing') return <FaTruck />;
                    if (s?.includes('return')) return <FaUndo />;
                    if (s === 'refunded') return <FaMoneyBillWave />;
                    return <FaBox />;
                  };

                  // Helper for Return Step Index
                  const getReturnStepIndex = (status) => {
                    const s = status?.toLowerCase() || '';
                    if (['returned', 'refunded'].includes(s)) return 4;
                    if (['pickup_scheduled'].includes(s)) return 3;
                    if (['return_confirmed'].includes(s)) return 2;
                    if (['return_requested'].includes(s)) return 1;
                    return 0;
                  };

                  const isReturnFlow = order.status?.toLowerCase().includes('return') ||
                    order.status?.toLowerCase().includes('refund') ||
                    order.status?.toLowerCase().includes('pickup');

                  const returnStepIdx = getReturnStepIndex(order.status);

                  // Helper for Status Text (New: Matches OrderDetails)
                  const getStatusLabel = (status, step) => {
                    if (!status) return 'Processing';
                    const s = status.toLowerCase();

                    if (s === 'cancelled') return 'Cancelled';
                    if (s === 'return_requested') return 'Return Requested';
                    if (s === 'return_confirmed') return 'Return Confirmed';
                    if (s === 'pickup_scheduled') return 'Pickup Scheduled';
                    if (s === 'refunded') return 'Refunded';
                    if (s === 'returned') return 'Returned';

                    // Standard Flow
                    if (s === 'delivered') return 'Delivered';
                    if (s === 'out_for_delivery') return 'Out for Delivery';
                    if (s === 'shipped') return 'Shipped';
                    if (s === 'confirmed') return 'Confirmed';

                    // Fallback to capitalizing first letter
                    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
                  };

                  return (
                    <motion.div
                      key={order.id || order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="ultra-order-card"
                      onClick={() => handleOrderClick(order)}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <div className="card-main-content">
                        {/* Left: Image */}
                        <div className="card-image-section">
                          <div className="img-box">
                            {imageUrl ? (
                              <img src={imageUrl} alt={firstItem.productName} onError={(e) => e.target.style.display = 'none'} />
                            ) : (
                              <div className="placeholder-img"><FaBox /></div>
                            )}
                          </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="card-info-section">
                          <div className="info-header">
                            <h3 className="product-name">{firstItem.productName || "Product Name"}</h3>
                            <div className="price-tag-mobile">{formatCurrency(order.total)}</div>
                          </div>

                          <div className="info-meta">
                            <span className="meta-item">Order #{order.id || order.orderId}</span>
                            <span className="meta-dot">•</span>
                            <span className="meta-item">{formatDate(order.createdAt || order.orderDate)}</span>
                            {totalItems > 1 && <span className="meta-badge">+{totalItems - 1} more types</span>}
                          </div>

                          {/* DYNAMIC VISUAL STEPPER (Delivery OR Return) */}
                          {!isCancelled && (
                            <div className="card-visual-stepper">
                              {isReturnFlow ? (
                                /* RETURN FLOW: Requested -> Confirmed -> Pickup -> Refunded */
                                [
                                  { label: 'Requested', icon: <FaTimesCircle /> },
                                  { label: 'Confirmed', icon: <FaCheckCircle /> },
                                  { label: 'Pickup', icon: <FaTruck /> },
                                  { label: 'Refunded', icon: <FaMoneyBillWave /> }
                                ].map((stepObj, idx) => {
                                  const currentStep = idx + 1;
                                  const isActive = returnStepIdx >= currentStep;
                                  const isCurrentStage = returnStepIdx === currentStep;

                                  // Specific colors based on User Image
                                  let activeClass = '';
                                  if (isActive) {
                                    if (idx === 0) activeClass = 'return-requested'; // Red
                                    else if (idx === 1) activeClass = 'return-confirmed'; // Blue
                                    else activeClass = 'return-general'; // Gray/Green
                                  }

                                  return (
                                    <div key={stepObj.label} className={`stepper-step ${isActive ? 'active' : ''} ${isCurrentStage ? 'current' : ''} ${activeClass}`}>
                                      <div className="step-dot-icon">{stepObj.icon}</div>
                                      <span className="step-label">{stepObj.label}</span>
                                      {idx < 3 && <div className={`step-line ${isActive && returnStepIdx > currentStep ? 'filled' : ''}`}></div>}
                                    </div>
                                  );
                                })
                              ) : (
                                /* STANDARD DELIVERY FLOW */
                                ['Confirmed', 'Shipped', 'Out', 'Delivered'].map((label, idx) => {
                                  const currentStep = idx + 1;
                                  const isActive = step >= currentStep;
                                  const isCompleted = step > currentStep;

                                  return (
                                    <div key={label} className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                      <div className="step-dot"></div>
                                      <span className="step-label">{label === 'Out' ? 'Out for Delivery' : label}</span>
                                      {idx < 3 && <div className={`step-line ${isCompleted ? 'filled' : ''}`}></div>}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* Status Enhanced Row (For Cancelled/Returns/Or Summary) */}
                          <div className="status-enhanced-row">
                            <div className={`status-pill-icon ${order.status?.toLowerCase() || 'pending'}`}>
                              {getStatusIcon(order.status)}
                              <span>
                                {getStatusLabel(order.status, step)}
                              </span>
                            </div>

                            <span className="delivery-est-text">
                              {isCancelled ? '' :
                                isReturnFlow ? '' :
                                  step === 4 ? `Delivered on ${formatExactDeliveryDate(order.deliveredDate || order.updatedAt || order.createdAt)}` :
                                    `Arriving by ${getEstimatedDeliveryDate(order.createdAt)}`}
                            </span>
                          </div>
                        </div>

                        {/* Right: Price & Action (Desktop) */}
                        <div className="card-action-section">
                          <div className="total-price">{formatCurrency(order.total)}</div>
                          <div className="view-details-btn">View Details</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Orders;