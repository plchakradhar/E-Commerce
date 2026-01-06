import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import {
  FaCheckCircle, FaShoppingBag, FaTruck, FaHome, FaFileInvoice
} from "react-icons/fa";
import { authAPI } from "../utils/api";
import '../styles/pages/OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    const orderFromState = location.state?.orderData;
    const orderFromStorage = localStorage.getItem('currentOrder');

    if (orderFromState) {
      setOrderData(orderFromState);
    } else if (orderFromStorage) {
      setOrderData(JSON.parse(orderFromStorage));
    } else {
      navigate('/products');
    }
  }, [location, navigate]);

  const generateInvoice = () => {
    if (!orderData) return;

    const invoiceContent = `
MASCLE - ORDER CONFIRMATION
==============================
Order ID: ${orderData.orderId}
Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}
SHIPPING ADDRESS:
-----------------
${orderData.shippingInfo.fullName}
${orderData.shippingInfo.address}
${orderData.shippingInfo.village}, ${orderData.shippingInfo.city}
${orderData.shippingInfo.state} - ${orderData.shippingInfo.zipCode}
Phone: ${orderData.shippingInfo.phone}
ORDER ITEMS:
------------
${orderData.items.map(item => `
Product: ${item.name}
Size: ${item.selectedSize}
Quantity: ${item.quantity}
Price: ₹${item.price} x ${item.quantity} = ₹${item.itemTotal}
`).join('')}
ORDER SUMMARY:
--------------
Subtotal: ₹${orderData.orderSummary.subtotal.toFixed(2)}
GST (0%): ₹0.00
CGST (0%): ₹0.00
Delivery Charge: ₹0.00
${orderData.coinsUsed > 0 ? `Coin Discount: -₹${orderData.coinsUsed.toFixed(2)}` : ''}
Total Amount: ₹${orderData.orderSummary.total.toFixed(2)}
ORDER STATUS: CONFIRMED
Thank you for shopping with Mascle!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-confirmation-${orderData.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("user");
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

  if (!orderData) {
    return (
      <div className="order-success-page">
        <Header
          userLoggedIn={!!currentUser}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onLogout={handleLogout}
        />
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  return (

    <div className="order-success-page">
      <Header
        userLoggedIn={!!currentUser}
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />

      <div className="success-container">
        <div className="success-header">
          <FaCheckCircle className="success-icon" />
          <h1>Thank you for your order!</h1>
          <p className="success-subtitle">Your order has been placed successfully.</p>
          <div className="order-id-badge">Order ID: {orderData.orderId}</div>
        </div>

        <div className="order-timeline">
          <div className="timeline-step active">
            <div className="step-dot"></div>
            <span>Confirmed</span>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="step-dot"></div>
            <span>Processing</span>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="step-dot"></div>
            <span>Shipped</span>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="step-dot"></div>
            <span>Delivered</span>
          </div>
        </div>

        <div className="success-content-grid">
          <div className="details-col">
            <div className="info-card">
              <h3>Shipping Details</h3>
              <div className="info-content">
                <p className="name">{orderData.shippingInfo.fullName}</p>
                <p>{orderData.shippingInfo.address}</p>
                <p>{orderData.shippingInfo.village}, {orderData.shippingInfo.city}</p>
                <p>{orderData.shippingInfo.state} - {orderData.shippingInfo.zipCode}</p>
                <p className="phone">Phone: {orderData.shippingInfo.phone}</p>
              </div>
            </div>

            <div className="info-card">
              <h3>Payment Information</h3>
              <div className="info-content">
                <p>Payment Method: <strong>UPI</strong></p>
                <p>Status: <span className="status-paid">Paid</span></p>
                <p>Date: {new Date(orderData.orderDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="summary-col">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="order-items-list">
                {orderData.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <img
                      src={item.images && item.images.length > 0
                        ? `http://localhost:8085${item.images[0]}`
                        : 'https://via.placeholder.com/60x80?text=No+Image'
                      }
                      alt={item.name}
                    />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Size: {item.selectedSize} | Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">₹{item.itemTotal}</div>
                  </div>
                ))}
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹{orderData.orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Delivery</span>
                  <span>₹0.00</span>
                </div>
                <div className="price-row">
                  <span>GST (0%)</span>
                  <span>₹0.00</span>
                </div>
                <div className="price-line">
                  <span>CGST (0%):</span>
                  <span>₹0.00</span>
                </div>
                {orderData.coinsUsed > 0 && (
                  <div className="price-line">
                    <span>Coin Discount:</span>
                    <span className="discount-value" style={{ color: '#000000', fontWeight: 'bold' }}>
                      -₹{orderData.coinsUsed.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="price-line total">
                  <span>Total</span>
                  <span>₹{orderData.orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn-black" onClick={generateInvoice}>
                <FaFileInvoice /> Download Invoice
              </button>
              <button className="btn-outline" onClick={() => navigate('/products')}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;