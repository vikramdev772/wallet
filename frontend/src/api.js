const API_BASE = 'https://wallet-auth-rijd.onrender.com/api';

function getUserId() {
  return localStorage.getItem('userId');
}

function setUserId(id) {
  localStorage.setItem('userId', id);
}

function removeUserId() {
  localStorage.removeItem('userId');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  signup: (name, email, password) =>
    request('POST', '/auth/signup', { name, email, password }),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  // Wallet
  getWallet: (userId) => {
    const id = userId !== undefined && userId !== null ? userId : getUserId();
    return request('GET', `/wallet?userId=${id}`);
  },

  sendMoney: (recipientEmail, amount, userId) => {
    const id = userId !== undefined && userId !== null ? userId : getUserId();
    return request('POST', `/wallet/send?userId=${id}`, { recipientEmail, amount });
  },

  // User Profile
  getProfile: (userId) => {
    const id = userId !== undefined && userId !== null ? userId : getUserId();
    return request('GET', `/user/profile?userId=${id}`);
  },

  // User ID management in localStorage
  setUserId,
  getUserId,
  removeUserId,
};
