/**
 * Shared Helper Functions
 */

// Format Date: "Oct 24, 2024"
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString("en-US", options);
};

// Format Currency: "₹1,299"
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Get Status Step (1-4)
export const getOrderStatusStep = (status) => {
  const s = String(status || '').toLowerCase();
  if (['delivered', 'refunded', 'returned'].includes(s)) return 4;
  if (['out for delivery', 'pickup_scheduled'].includes(s)) return 3;
  if (['shipped', 'return_confirmed'].includes(s)) return 2;
  if (s === 'cancelled') return -1;
  return 1; // Ordered / Return Requested
};

// Get Status Badge Color
export const getStatusBadgeColor = (status) => {
  const s = String(status || '').toLowerCase();
  if (['delivered', 'refunded', 'returned'].includes(s)) return '#40c057'; // Green
  if (['cancelled', 'return_requested'].includes(s)) return '#fa5252'; // Red
  if (['shipped', 'out for delivery', 'pickup_scheduled', 'return_confirmed'].includes(s)) return '#228be6'; // Blue
  return '#fab005'; // Yellow/Orange for pending
};

// Estimate Delivery Date (+5 days)
export const getEstimatedDeliveryDate = (orderDate, status) => {
  if (!orderDate) return "N/A";
  const date = new Date(orderDate);
  date.setDate(date.getDate() + 5);

  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return date.toLocaleDateString("en-US", options);
};

// Format Exact Delivery Date with time
export const formatExactDeliveryDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} at ${timePart}`;
};

// Generate Verification Code (6 digits)
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate Referral Code
export const generateReferralCode = (username) => {
  const prefix = username ? username.substring(0, 3).toUpperCase() : 'GENZ';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
};

// Generate Order ID
export const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
};