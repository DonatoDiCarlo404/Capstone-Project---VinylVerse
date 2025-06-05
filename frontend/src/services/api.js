import { API_URL, DISCOGS_API_URL } from '../utils/constants';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Errore nella richiesta');
  }
  return response.json();
};

// Auth endpoints
export const authAPI = {
  login: (credentials) => 
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  register: (userData) => 
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(handleResponse),

  getProfile: () => 
    fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(handleResponse),
    
  getReviews: () => 
    fetch(`${API_URL}/auth/profile/reviews`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(handleResponse)
};

// Vinyl endpoints
export const vinylAPI = {
  getAll: async () => {
    try {
      console.log('Calling API:', `${API_URL}/vinyls`); // Debug log
      const response = await fetch(`${API_URL}/vinyls`); // Changed to /vinyls
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Response:', errorData);
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const vinyls = await response.json();
      console.log('API Response data:', vinyls); // Debug log
      
      return vinyls.map(vinyl => ({
        ...vinyl,
        coverImage: vinyl.coverImage || `${DISCOGS_API_URL}/releases/${vinyl.discogsId}/images/1`
      }));
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Cart endpoints
export const cartAPI = {
  get: () => 
    fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(handleResponse),

  add: (vinylId) => 
    fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ vinylId })
    }).then(handleResponse),

  remove: (vinylId) => 
    fetch(`${API_URL}/cart/remove/${vinylId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(handleResponse)
};

// Order endpoints
export const orderAPI = {
  checkout: (shippingData) => 
    fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(shippingData)
    }).then(handleResponse),

  getHistory: () => 
    fetch(`${API_URL}/orders/history`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(handleResponse)
};