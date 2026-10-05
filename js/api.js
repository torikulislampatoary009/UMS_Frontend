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
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'Invalid server response.' }; }

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!location.pathname.endsWith('login.html') && !location.pathname.endsWith('index.html')) location.href = 'login.html';
    throw new Error(data.error || 'Session expired. Please sign in again.');
  }
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
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

async function getFeeStructures() { return apiRequest('/fee-structures', 'GET'); }
async function createFeeStructureRequest(payload) { return apiRequest('/fee-structures', 'POST', payload); }
async function updateFeeStructureRequest(id, payload) { return apiRequest(`/fee-structures/${id}`, 'PUT', payload); }
async function deleteFeeStructureRequest(id) { return apiRequest(`/fee-structures/${id}`, 'DELETE'); }

async function getInvoices() { return apiRequest('/invoices', 'GET'); }
async function getInvoicesForStudentRequest(studentId) { return apiRequest(`/invoices/student/${studentId}`, 'GET'); }
async function getInvoiceDetail(id) { return apiRequest(`/invoices/${id}`, 'GET'); }
async function generateInvoiceRequest(payload) { return apiRequest('/invoices', 'POST', payload); }
async function recordPaymentRequest(invoiceId, payload) { return apiRequest(`/invoices/${invoiceId}/payments`, 'POST', payload); }
async function deleteInvoiceRequest(id) { return apiRequest(`/invoices/${id}`, 'DELETE'); }

async function forgotPasswordRequest(email) { return apiRequest('/auth/forgot-password', 'POST', { email }); }
async function resetPasswordRequest(token, newPassword) { return apiRequest('/auth/reset-password', 'POST', { token, newPassword }); }

async function getMyStudentProfile() { return apiRequest('/students/me', 'GET'); }
async function getMyFacultyProfile() { return apiRequest('/faculty/me', 'GET'); }
async function getMyEnrollments() { return apiRequest('/enrollments/mine', 'GET'); }
async function getMyInvoices() { return apiRequest('/invoices/mine', 'GET'); }
async function getMySections() { return apiRequest('/sections/mine', 'GET'); }

async function getPortalSummary(){return apiRequest('/portal/summary');}
async function getProfile(){return apiRequest('/portal/profile');}
async function updateProfile(payload){return apiRequest('/portal/profile','PUT',payload);}
async function getUsers(){return apiRequest('/portal/users');}
async function updateUserStatus(id,status){return apiRequest(`/portal/users/${id}/status`,'PATCH',{status});}
async function getNotices(){return apiRequest('/portal/notices');}
async function getAdminNotices(){return apiRequest('/portal/admin/notices');}
async function createNotice(payload){return apiRequest('/portal/notices','POST',payload);}
async function updateNotice(id,payload){return apiRequest(`/portal/notices/${id}`,'PUT',payload);}
async function deleteNotice(id){return apiRequest(`/portal/notices/${id}`,'DELETE');}
async function getEvents(){return apiRequest('/portal/events');}
async function getAdminEvents(){return apiRequest('/portal/admin/events');}
async function createEvent(payload){return apiRequest('/portal/events','POST',payload);}
async function deleteEvent(id){return apiRequest(`/portal/events/${id}`,'DELETE');}
async function getTimetable(){return apiRequest('/portal/timetable');}
async function createTimetable(payload){return apiRequest('/portal/timetable','POST',payload);}
async function deleteTimetable(id){return apiRequest(`/portal/timetable/${id}`,'DELETE');}
async function getMaterials(){return apiRequest('/portal/materials');}
async function createMaterial(payload){return apiRequest('/portal/materials','POST',payload);}
async function deleteMaterial(id){return apiRequest(`/portal/materials/${id}`,'DELETE');}
async function getRequests(){return apiRequest('/portal/requests');}
async function createRequest(payload){return apiRequest('/portal/requests','POST',payload);}
async function updateRequest(id,payload){return apiRequest(`/portal/requests/${id}`,'PATCH',payload);}
async function getApplications(){return apiRequest('/portal/applications');}
async function createApplication(payload){return apiRequest('/portal/applications','POST',payload);}
async function updateApplication(id,payload){return apiRequest(`/portal/applications/${id}`,'PATCH',payload);}
async function getBooks(){return apiRequest('/portal/library/books');}
async function createBook(payload){return apiRequest('/portal/library/books','POST',payload);}
async function getLoans(){return apiRequest('/portal/library/loans');}
async function issueBook(payload){return apiRequest('/portal/library/loans','POST',payload);}
async function returnBook(id){return apiRequest(`/portal/library/loans/${id}/return`,'PATCH');}
async function getHostelRooms(){return apiRequest('/portal/hostel/rooms');}
async function createHostelRoom(payload){return apiRequest('/portal/hostel/rooms','POST',payload);}
async function getHostelAllocations(){return apiRequest('/portal/hostel/allocations');}
async function allocateHostel(payload){return apiRequest('/portal/hostel/allocations','POST',payload);}
async function getTransportRoutes(){return apiRequest('/portal/transport/routes');}
async function createTransportRoute(payload){return apiRequest('/portal/transport/routes','POST',payload);}
async function getTransportAssignments(){return apiRequest('/portal/transport/assignments');}
async function assignTransport(payload){return apiRequest('/portal/transport/assignments','POST',payload);}
async function getCalendar(){return apiRequest('/portal/calendar');}
async function createCalendar(payload){return apiRequest('/portal/calendar','POST',payload);}
async function deleteCalendar(id){return apiRequest(`/portal/calendar/${id}`,'DELETE');}
async function getAuditLogs(){return apiRequest('/portal/audit');}
async function getAvailableSections(){return apiRequest('/enrollments/available');}
async function selfEnroll(sectionId){return apiRequest('/enrollments/self','POST',{sectionId});}
async function selfDrop(id){return apiRequest(`/enrollments/${id}/self-drop`,'PATCH');}

async function getMyHostel(){return apiRequest('/portal/hostel/mine');}
async function getMyTransport(){return apiRequest('/portal/transport/mine');}

async function getPublicPrograms(){return apiRequest('/portal/public/programs');}
async function createPublicApplication(payload){return apiRequest('/portal/public/applications','POST',payload);}

async function changePasswordRequest(currentPassword,newPassword){return apiRequest('/auth/change-password','POST',{currentPassword,newPassword});}
