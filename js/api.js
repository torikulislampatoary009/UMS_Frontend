// Centralized API layer — every page calls through this instead of
// writing raw fetch() calls scattered across the codebase. Makes it
// easy to change the base URL or add auth headers in one place later.

const API_BASE_URL = 'https://ums-backend-xkyp.onrender.com/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };

  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

async function loginRequest(email, password) {
  return apiRequest('/auth/login', 'POST', { email, password });
}

async function registerRequest({ name, email, password, role }) {
  return apiRequest('/auth/register', 'POST', { name, email, password, role });
}
