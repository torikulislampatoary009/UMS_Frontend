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

async function getStudents() {
  return apiRequest('/students', 'GET');
}

async function getEligibleStudentUsers() {
  return apiRequest('/students/eligible-users', 'GET');
}

async function createStudentRequest(payload) {
  return apiRequest('/students', 'POST', payload);
}

async function updateStudentRequest(id, payload) {
  return apiRequest(`/students/${id}`, 'PUT', payload);
}

async function deleteStudentRequest(id) {
  return apiRequest(`/students/${id}`, 'DELETE');
}

async function getSemesters() {
  return apiRequest('/semesters', 'GET');
}

async function createSemesterRequest(payload) {
  return apiRequest('/semesters', 'POST', payload);
}

async function updateSemesterRequest(id, payload) {
  return apiRequest(`/semesters/${id}`, 'PUT', payload);
}

async function deleteSemesterRequest(id) {
  return apiRequest(`/semesters/${id}`, 'DELETE');
}

async function setCurrentSemesterRequest(id) {
  return apiRequest(`/semesters/${id}/set-current`, 'PATCH');
}

async function getSections() {
  return apiRequest('/sections', 'GET');
}

async function createSectionRequest(payload) {
  return apiRequest('/sections', 'POST', payload);
}

async function updateSectionRequest(id, payload) {
  return apiRequest(`/sections/${id}`, 'PUT', payload);
}

async function deleteSectionRequest(id) {
  return apiRequest(`/sections/${id}`, 'DELETE');
}

async function getEnrollments() {
  return apiRequest('/enrollments', 'GET');
}

async function createEnrollmentRequest({ studentId, sectionId }) {
  return apiRequest('/enrollments', 'POST', { studentId, sectionId });
}

async function updateEnrollmentStatusRequest(id, status) {
  return apiRequest(`/enrollments/${id}/status`, 'PATCH', { status });
}

async function deleteEnrollmentRequest(id) {
  return apiRequest(`/enrollments/${id}`, 'DELETE');
}

async function getAttendanceRoster(sectionId, date) {
  return apiRequest(`/attendance/roster?sectionId=${sectionId}&date=${date}`, 'GET');
}

async function markAttendanceRequest({ enrollmentId, date, status }) {
  return apiRequest('/attendance', 'POST', { enrollmentId, date, status });
}

async function deleteAttendanceRequest(id) {
  return apiRequest(`/attendance/${id}`, 'DELETE');
}

async function getExams(sectionId) {
  return apiRequest(`/exams?sectionId=${sectionId}`, 'GET');
}

async function createExamRequest(payload) {
  return apiRequest('/exams', 'POST', payload);
}

async function updateExamRequest(id, payload) {
  return apiRequest(`/exams/${id}`, 'PUT', payload);
}

async function deleteExamRequest(id) {
  return apiRequest(`/exams/${id}`, 'DELETE');
}

async function getExamRoster(examId) {
  return apiRequest(`/exams/${examId}/roster`, 'GET');
}

async function markExamGradeRequest(examId, { enrollmentId, obtainedMarks }) {
  return apiRequest(`/exams/${examId}/marks`, 'POST', { enrollmentId, obtainedMarks });
}

async function getGradeSummary(enrollmentId) {
  return apiRequest(`/exams/summary/${enrollmentId}`, 'GET');
}


async function forgotPasswordRequest(email){ return apiRequest('/auth/forgot-password','POST',{email}); }
async function resetPasswordRequest(token,newPassword){ return apiRequest('/auth/reset-password','POST',{token,newPassword}); }
async function getMe(){ return apiRequest('/auth/me','GET'); }
async function changePasswordRequest(currentPassword,newPassword){ return apiRequest('/auth/change-password','POST',{currentPassword,newPassword}); }
async function getUniversitySummary(){ return apiRequest('/university/summary','GET'); }
async function getUniversityModule(module){ return apiRequest(`/university/${module}`,'GET'); }
async function createUniversityRecord(module,payload){ return apiRequest(`/university/${module}`,'POST',payload); }
async function updateUniversityRecord(module,id,payload){ return apiRequest(`/university/${module}/${id}`,'PUT',payload); }
async function deleteUniversityRecord(module,id){ return apiRequest(`/university/${module}/${id}`,'DELETE'); }
async function getAuditLogs(){ return apiRequest('/university/audit-logs','GET'); }
