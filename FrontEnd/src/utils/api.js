import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add user ID header when available
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      config.headers['User-Id'] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  signup: (userData) => api.post('/users/signup', userData),
  logout: () => api.post('/users/logout', {}),
  checkSession: () => api.get('/users/check-session'),
  sendResetOTP: (email) => api.post('/users/send-reset-otp', { email }),
  verifyResetOTP: (data) => api.post('/users/verify-reset-otp', data),
  resetPassword: (data) => api.post('/users/reset-password', data),
};

// User APIs
export const userAPI = {
  getCoinHistory: (userId) => api.get(`/users/${userId}/coin-history`),
  getReferralLink: (userId) => api.get(`/users/${userId}/referral-link`),
};

// Product APIs
export const productAPI = {
  getAll: () => api.get('/admin/products'),
  getById: (id) => api.get(`/admin/products/${id}`),
  getByCategory: (category) => api.get(`/admin/products/category/${category}`),
  search: (query) => api.get(`/admin/products/search?query=${encodeURIComponent(query)}`),
};

// Cart APIs
export const cartAPI = {
  get: (userId) => api.get(`/cart/${userId}`),
  add: (data) => api.post('/cart', data),
  update: (userId, itemId, data) => api.put(`/cart/${userId}/${itemId}`, data),
  remove: (userId, itemId) => api.delete(`/cart/${userId}/${itemId}`),
  clear: (userId) => api.delete(`/cart/clear/${userId}`),
};

// Wishlist APIs
export const wishlistAPI = {
  get: (userId) => api.get(`/wishlist/${userId}`),
  add: (userId, productId) => api.post(`/wishlist/${userId}/${productId}`, {}),
  remove: (userId, productId) => api.delete(`/wishlist/${userId}/${productId}`),
  clear: (userId) => api.delete(`/wishlist/clear/${userId}`),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  getDetails: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (id) => axios.put(`${BASE_URL}/orders/${id}/cancel`),
  returnOrder: (id, payload) => api.put(`/orders/${id}/return`, payload),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, null, { params: { status } }),
};

// Review APIs
export const reviewAPI = {
  add: (formData) => {
    return api.post('/reviews/add', formData);
  },
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  checkExisting: (orderId, productId) => api.get(`/reviews/order/${orderId}/product/${productId}`),
};

export default api;