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

async function getDepartments() {
  return apiRequest('/departments', 'GET');
}

async function createDepartmentRequest({ name, code }) {
  return apiRequest('/departments', 'POST', { name, code });
}

async function updateDepartmentRequest(id, { name, code }) {
  return apiRequest(`/departments/${id}`, 'PUT', { name, code });
}

async function deleteDepartmentRequest(id) {
  return apiRequest(`/departments/${id}`, 'DELETE');
}

async function getPrograms() {
  return apiRequest('/programs', 'GET');
}

async function createProgramRequest(payload) {
  return apiRequest('/programs', 'POST', payload);
}

async function updateProgramRequest(id, payload) {
  return apiRequest(`/programs/${id}`, 'PUT', payload);
}

async function deleteProgramRequest(id) {
  return apiRequest(`/programs/${id}`, 'DELETE');
}

async function getCourses() {
  return apiRequest('/courses', 'GET');
}

async function createCourseRequest(payload) {
  return apiRequest('/courses', 'POST', payload);
}

async function updateCourseRequest(id, payload) {
  return apiRequest(`/courses/${id}`, 'PUT', payload);
}

async function deleteCourseRequest(id) {
  return apiRequest(`/courses/${id}`, 'DELETE');
}

async function getFaculty() {
  return apiRequest('/faculty', 'GET');
}

async function getEligibleFacultyUsers() {
  return apiRequest('/faculty/eligible-users', 'GET');
}

async function createFacultyRequest(payload) {
  return apiRequest('/faculty', 'POST', payload);
}

async function updateFacultyRequest(id, payload) {
  return apiRequest(`/faculty/${id}`, 'PUT', payload);
}

async function deleteFacultyRequest(id) {
  return apiRequest(`/faculty/${id}`, 'DELETE');
}
