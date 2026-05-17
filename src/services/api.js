const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`
  const res = await fetch(url, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.message || 'Error de servidor')
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const authApi = {
  loginWithProvider: (idToken, provider) =>
    request('/auth/login-provider', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken, provider, client_type: 'web' }),
    }),
}

export const usersApi = {
  completeOnboarding: (profileData) =>
    request('/users/profile/onboarding', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),
  activateSeller: (sellerData) =>
    request('/users/seller/activate', {
      method: 'POST',
      body: JSON.stringify(sellerData),
    }),
  getMe: () => request('/users/me'),
}

export const cartApi = {
  getCart: () => request('/cart'),
  addItem: (productId, quantity = 1) =>
    request('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  updateItem: (productId, quantity) =>
    request(`/cart/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (productId) =>
    request(`/cart/${productId}`, { method: 'DELETE' }),
  clearCart: () =>
    request('/cart', { method: 'DELETE' }),
}

export const ordersApi = {
  createOrder: () =>
    request('/orders', { method: 'POST' }),
  getOrders: () => request('/orders'),
  getAllOrders: () => request('/orders/all'),
}

export const adminApi = {
  getStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  updateUser: (userId, data) =>
    request(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getProducts: () => request('/admin/products'),
  updateProductStatus: (productId, status) =>
    request(`/admin/products/${productId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getOrders: () => request('/admin/orders'),
}

export const uploadApi = {
  uploadImages: (images) =>
    request('/upload', {
      method: 'POST',
      body: JSON.stringify({ images }),
    }),
}

export const notificationsApi = {
  getNotifications: () => request('/notifications'),
  getUnreadCount: () => request('/notifications/unread'),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
}

export const wishlistApi = {
  getWishlist: () => request('/wishlist'),
  toggle: (productId) => request(`/wishlist/${productId}`, { method: 'POST' }),
  check: (productId) => request(`/wishlist/check/${productId}`),
}

export const messagesApi = {
  sendMessage: (sellerId, productId, message) =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify({ seller_id: sellerId, product_id: productId, message }),
    }),
  getMessages: () => request('/messages'),
  getUnreadCount: () => request('/messages/unread'),
  markAsRead: (messageId) =>
    request(`/messages/${messageId}/read`, { method: 'PATCH' }),
}

export const reviewsApi = {
  createReview: (productId, rating, comment) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, rating, comment }),
    }),
  getProductReviews: (productId) => request(`/products/${productId}/reviews`),
}

export const productsApi = {
  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    }),
  deleteProduct: (id) =>
    request(`/products/${id}`, { method: 'DELETE' }),
  getMyProducts: () => request('/products/my'),
  getProductById: (id) => request(`/products/${id}`),
  searchProducts: (params) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/products/search${qs ? `?${qs}` : ''}`)
  },
  getProductDetail: (id) => request(`/products/${id}`),
}
