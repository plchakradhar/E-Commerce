import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import Loading from "../components/common/Loading";
import {
  FaCheckCircle, FaCreditCard, FaMapMarkerAlt, FaQrcode, FaRupeeSign, FaTruck
} from "react-icons/fa";
import { orderAPI, cartAPI, authAPI } from "../utils/api";
import { generateOrderId } from "../utils/helpers";
import '../styles/pages/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "", address: "", city: "", state: "", zipCode: "",
    village: "", phone: "", email: "", landmark: ""
  });
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0, shipping: 0, total: 0, discount: 0
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [villageLoading, setVillageLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Coin Logic State
  const [useCoins, setUseCoins] = useState(false);
  const [coinsUsed, setCoinsUsed] = useState(0);
  const availableCoins = 200; // Mock available coins

  const checkUserLoginStatus = React.useCallback(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserLoggedIn(true);
        setCurrentUser(user);
        setShippingInfo({
          fullName: user.fullName || "",
          email: user.email || `${user.username}@example.com` || "",
          phone: user.mobile || "",
          address: user.address || "",
          village: user.village || "",
          city: user.city || "",
          state: user.state || "",
          zipCode: user.zipCode || "",
          landmark: user.landmark || ""
        });
      } catch {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const initializeCheckout = React.useCallback(() => {
    const items = location.state?.items || [];

    if (items.length === 0) {
      navigate('/products');
      return;
    }

    const processedItems = items.map(item => ({
      ...item,
      itemTotal: (item.price || 0) * (item.quantity || 1)
    }));

    setCheckoutItems(processedItems);

    const subtotal = processedItems.reduce((sum, item) => sum + item.itemTotal, 0);
    const shipping = 0; // Free Shipping
    // Re-calculate total based on current coin usage
    const discount = useCoins ? coinsUsed : 0;
    const total = Math.max(0, subtotal + shipping - discount);

    setOrderSummary({ subtotal, shipping, total, discount });
    setLoading(false);
  }, [location.state, navigate, useCoins, coinsUsed]);

  useEffect(() => {
    checkUserLoginStatus();
    initializeCheckout();
  }, [checkUserLoginStatus, initializeCheckout]);

  // Handle Coin Input
  const handleCoinChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 0;

    // Constraints
    const subtotal = checkoutItems.reduce((sum, item) => sum + item.itemTotal, 0);
    const maxCoins = Math.min(availableCoins, 50, subtotal); // Max 50, or available, or subtotal

    if (value > maxCoins) value = maxCoins;
    if (value < 0) value = 0;

    setCoinsUsed(value);
  };

  const toggleCoins = () => {
    setUseCoins(!useCoins);
    if (!useCoins) {
      // When turning ON, default to max possible (up to 50)
      const subtotal = checkoutItems.reduce((sum, item) => sum + item.itemTotal, 0);
      setCoinsUsed(Math.min(availableCoins, 50, parseInt(subtotal)));
    } else {
      setCoinsUsed(0);
    }
  };

  const fetchVillageDetails = async (zipCode) => {
    if (zipCode.length !== 6) return;
    setVillageLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${zipCode}`);
      const data = await response.json();
      if (data && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setShippingInfo(prev => ({
          ...prev,
          village: postOffice.Block || postOffice.Division || "",
          city: postOffice.District || "",
          state: postOffice.State || ""
        }));
      }
    } catch (error) {
      console.error("Error fetching village details:", error);
    }
    setVillageLoading(false);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));

    if (name === "zipCode" && value.length === 6) {
      fetchVillageDetails(value);
    }
  };

  const handlePlaceOrder = async () => {
    setOrderProcessing(true);

    try {
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);

      const orderData = {
        userId: currentUser.id,
        items: checkoutItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          images: item.images || []
        })),
        total: orderSummary.total,
        discount: orderSummary.discount,
        coinsUsed: useCoins ? coinsUsed : 0,
        shippingInfo: shippingInfo
      };

      const orderResponse = await orderAPI.create(orderData);

      if (orderResponse.data.status === "success") {
        try {
          await cartAPI.clear(currentUser.id);
        } catch (cartError) {
          console.warn("Cart clear failed:", cartError);
        }

        setCurrentStep(3);
      } else {
        throw new Error(orderResponse.data.message);
      }

    } catch (error) {
      console.error("Error in order placement:", error);
      // Fallback to localStorage
      const orderData = {
        orderId: generateOrderId(),
        userId: currentUser?.id || "demo-user",
        items: checkoutItems,
        totalAmount: orderSummary.total,
        discount: orderSummary.discount,
        coinsUsed: useCoins ? coinsUsed : 0,
        shippingInfo: shippingInfo,
        paymentMethod: "upi",
        paymentStatus: "completed",
        orderStatus: "confirmed",
        orderDate: new Date().toISOString()
      };

      const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const newOrders = [...existingOrders, orderData];
      localStorage.setItem('userOrders', JSON.stringify(newOrders));
      localStorage.setItem('lastOrder', JSON.stringify(orderData));

      setCurrentStep(3);
    } finally {
      setOrderProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city ||
        !shippingInfo.state || !shippingInfo.zipCode || !shippingInfo.phone || !shippingInfo.village) {
        alert("Please fill in all shipping information including village");
        return;
      }

      if (shippingInfo.phone.length !== 10) {
        alert("Please enter a valid 10-digit phone number");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const generateInvoice = () => {
    const invoiceContent = `
GENZFITS - INVOICE
=======================
Order ID: ${orderId}
Order Date: ${new Date().toLocaleDateString()}
SHIPPING ADDRESS:
-----------------
${shippingInfo.fullName}
${shippingInfo.address}
${shippingInfo.village}, ${shippingInfo.city}
${shippingInfo.state} - ${shippingInfo.zipCode}
Phone: ${shippingInfo.phone}
${shippingInfo.landmark ? `Landmark: ${shippingInfo.landmark}` : ''}
ORDER ITEMS:
------------
${checkoutItems.map(item => `
Product: ${item.name}
Size: ${item.selectedSize}
Quantity: ${item.quantity}
Price: ₹${item.price} x ${item.quantity} = ₹${item.itemTotal}
`).join('')}
ORDER SUMMARY:
--------------
Subtotal: ₹${orderSummary.subtotal.toFixed(2)}
Subtotal: ₹${orderSummary.subtotal.toFixed(2)}
GST (0%): ₹0.00
CGST (0%): ₹0.00
Delivery Charge: ₹0.00
${useCoins ? `Coin Discount: -₹${coinsUsed.toFixed(2)}` : ''}
Total Amount: ₹${orderSummary.total.toFixed(2)}
Thank you for shopping with Mascle!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const redirectToOrderSuccess = React.useCallback(() => {
    navigate('/ordersuccess', {
      state: {
        orderId: orderId,
        orderData: {
          orderId: orderId,
          items: checkoutItems,
          shippingInfo,
          orderSummary,
          orderDate: new Date().toISOString()
        }
      }
    });
  }, [navigate, orderId, checkoutItems, shippingInfo, orderSummary]);

  useEffect(() => {
    if (currentStep === 3 && orderId) {
      const redirectTimer = setTimeout(() => {
        redirectToOrderSuccess();
      }, 5000);

      return () => clearTimeout(redirectTimer);
    }
  }, [currentStep, orderId, redirectToOrderSuccess]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUserLoggedIn(false);
      setCurrentUser(null);
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

  if (loading) {
    return (
      <div className="checkout-page">
        <Header
          userLoggedIn={userLoggedIn}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onLogout={handleLogout}
        />
        <Loading message="Loading checkout..." />
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="checkout-page">
        <Header
          userLoggedIn={userLoggedIn}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onLogout={handleLogout}
        />
        <div className="empty-checkout">
          <h2>No items to checkout</h2>
          <button onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header
        userLoggedIn={userLoggedIn}
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />

      <div className="checkout-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <span>1</span>
          <p>Shipping</p>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <span>2</span>
          <p>Payment</p>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <span>3</span>
          <p>Success</p>
        </div>
      </div>

      <div className="checkout-container">
        {currentStep < 3 ? (
          <div className="checkout-content">
            <div className="checkout-form">
              {currentStep === 1 && (
                <div className="form-step">
                  <h2><FaMapMarkerAlt /> Shipping Information</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        maxLength="10"
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Complete Address *</label>
                      <textarea
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        placeholder="House No, Building, Street, Area"
                        required
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP/Pincode *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingChange}
                        maxLength="6"
                        required
                      />
                      {villageLoading && <div className="loading-small">Loading village details...</div>}
                    </div>
                    <div className="form-group">
                      <label>Village/Town *</label>
                      <input
                        type="text"
                        name="village"
                        value={shippingInfo.village}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Landmark (Optional)</label>
                      <input
                        type="text"
                        name="landmark"
                        value={shippingInfo.landmark}
                        onChange={handleShippingChange}
                        placeholder="Nearby famous place for easy delivery"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step">
                  <h2><FaCreditCard /> Payment Method</h2>
                  <div className="payment-methods">
                    <div className="payment-method selected">
                      <div className="method-header">
                        <FaQrcode className="method-icon" />
                        <div>
                          <h3>UPI Payment</h3>
                          <p>Direct order placement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="summary-item">
                    <img
                      src={item.images && item.images.length > 0
                        ? `http://localhost:8085${item.images[0]}`
                        : 'https://via.placeholder.com/60x80?text=No+Image'
                      }
                      alt={item.name}
                    />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Size: {item.selectedSize}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-total">₹{item.itemTotal}</div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-line">
                  <span>Item Total:</span>
                  <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>

                {/* Coin Redemption Section */}
                <div className="coin-redemption">
                  <div className="coin-header">
                    <label className="switch">
                      <input type="checkbox" checked={useCoins} onChange={toggleCoins} />
                      <span className="slider round"></span>
                    </label>
                    <span>Use Coins (Available: {availableCoins})</span>
                  </div>
                  {useCoins && (
                    <div className="coin-input-container">
                      <input
                        type="number"
                        value={coinsUsed}
                        onChange={handleCoinChange}
                        min="1"
                        max="50"
                        className="coin-input"
                      />
                      <span className="coin-note">max 50 coins</span>
                    </div>
                  )}
                </div>

                <div className="total-line delivery-charge">
                  <span><FaTruck /> Delivery Charge:</span>
                  <span className="free-shipping">₹0.00</span>
                </div>

                {useCoins && coinsUsed > 0 && (
                  <div className="total-line discount">
                    <span>Coin Discount:</span>
                    <span className="discount-value">-₹{coinsUsed.toFixed(2)}</span>
                  </div>
                )}

                <div className="total-line">
                  <span>GST (0%):</span>
                  <span>₹0.00</span>
                </div>
                <div className="total-line">
                  <span>CGST (0%):</span>
                  <span>₹0.00</span>
                </div>
                <div className="total-line grand-total">
                  <span>Total Amount:</span>
                  <span>₹{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-actions">
                {currentStep > 1 && (
                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    disabled={orderProcessing}
                  >
                    Back
                  </button>
                )}
                {currentStep === 1 ? (
                  <button className="btn-primary" onClick={handleNextStep}>
                    Continue to Payment
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={handlePlaceOrder}
                    disabled={orderProcessing}
                  >
                    {orderProcessing ? 'Placing Order...' : 'Place Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="order-confirmation">
            <div className="confirmation-content">
              <FaCheckCircle className="success-icon" />
              <h2>Order Confirmed Successfully!</h2>
              <div className="order-id">Order ID: {orderId}</div>

              <div className="confirmation-details">
                <div className="detail-section">
                  <h3>Delivery Address</h3>
                  <p><strong>{shippingInfo.fullName}</strong></p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.village}, {shippingInfo.city}</p>
                  <p>{shippingInfo.state} - {shippingInfo.zipCode}</p>
                  <p>Phone: {shippingInfo.phone}</p>
                </div>

                <div className="detail-section">
                  <h3>Order Details</h3>
                  <p><strong>Items:</strong> {checkoutItems.length} product(s)</p>
                  <p><strong>Total Amount:</strong> ₹{orderSummary.total.toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> UPI</p>
                  <p><strong>Payment Status:</strong> Paid ✓</p>
                </div>
              </div>

              <div className="confirmation-actions">
                <button className="btn-primary" onClick={generateInvoice}>
                  Download Invoice
                </button>
                <button className="btn-secondary" onClick={redirectToOrderSuccess}>
                  Go to Order Success Page
                </button>
                <button className="btn-outline" onClick={() => navigate('/products')}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;