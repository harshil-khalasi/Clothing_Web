import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // If no env var, use current hostname on port 5000
  return `http://${window.location.hostname}:5000/api`;
};

const API_BASE_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for tokens
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// ============== AUTH API CALLS ==============

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/users/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('/users', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await apiClient.put('/users/profile', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

// ============== PRODUCT API CALLS ==============

export const getAllProducts = async (isAdmin = false) => {
  const response = await apiClient.get(`/products${isAdmin ? '?admin=true' : ''}`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await apiClient.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await apiClient.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// ============== SUBCATEGORY API CALLS ==============

export const getAllSubcategories = async () => {
  const response = await apiClient.get('/subcategories');
  return response.data;
};

export const createSubcategory = async (data) => {
  const response = await apiClient.post('/subcategories', data);
  return response.data;
};

export const updateSubcategory = async (id, data) => {
  const response = await apiClient.put(`/subcategories/${id}`, data);
  return response.data;
};

export const deleteSubcategory = async (id) => {
  const response = await apiClient.delete(`/subcategories/${id}`);
  return response.data;
};

// ============== USER MANAGEMENT API CALLS ==============

export const getAllUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

// ============== DASHBOARD API CALLS ==============

export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

// ============== ORDER API CALLS ==============

export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await apiClient.get('/orders/myorders');
  return response.data;
};

export const getOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const getRazorpayOrderId = async (id) => {
  const response = await apiClient.post(`/orders/${id}/pay`);
  return response.data;
};

export const verifyPaymentServer = async (id, paymentData) => {
  const response = await apiClient.post(`/orders/${id}/verify`, paymentData);
  return response.data;
};

// ============== CART API CALLS ==============

export const getCartServer = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addToCartServer = async (cartData) => {
  const response = await apiClient.post('/cart', cartData);
  return response.data;
};

export const syncCartServer = async (cartItems) => {
  const response = await apiClient.post('/cart/sync', { cartItems });
  return response.data;
};

export const removeFromCartServer = async (productId, selectedSize) => {
  const response = await apiClient.delete(`/cart/${productId}?selectedSize=${selectedSize}`);
  return response.data;
};

export const clearCartServer = async () => {
  const response = await apiClient.delete('/cart');
  return response.data;
};

export default apiClient;