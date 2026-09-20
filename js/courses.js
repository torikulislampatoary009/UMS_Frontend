const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('courseTableBody');
const addForm = document.getElementById('addForm');
const deptSelect = document.getElementById('newDept');

if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

let departmentCache = [];

function showError(message) {
  successMsg.style.display = 'none';
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
}

function showSuccess(message) {
  errorMsg.style.display = 'none';
  successMsg.textContent = message;
  successMsg.style.display = 'block';
}

async function loadDepartmentOptions() {
  const result = await getDepartments();
  departmentCache = result.data;
  deptSelect.innerHTML = departmentCache.map((d) => `<option value="${d.id}">${d.name}</option>`).join('');
}

function renderRow(course) {
  const tr = document.createElement('tr');
  tr.dataset.id = course.id;
  tr.innerHTML = `
    <td>${course.id}</td>
    <td class="view-code">${course.code}</td>
    <td class="view-title">${course.title}</td>
    <td class="view-credits">${course.credit_hours}</td>
    <td class="view-dept" data-dept-id="${course.department_id}">${course.department_name}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${course.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${course.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadCourses() {
  try {
    const result = await getCourses();
    tableBody.innerHTML = '';
    result.data.forEach((c) => tableBody.appendChild(renderRow(c)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('newCode').value.trim();
  const title = document.getElementById('newTitle').value.trim();
  const creditHours = document.getElementById('newCredits').value;
  const departmentId = deptSelect.value;

  try {
    await createCourseRequest({ code, title, creditHours, departmentId });
    showSuccess(`Course "${code}" added.`);
    addForm.reset();
    loadCourses();
  } catch (err) {
    showError(err.message);
  }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentCode = row.querySelector('.view-code').textContent;
  const currentTitle = row.querySelector('.view-title').textContent;
  const currentCredits = row.querySelector('.view-credits').textContent;
  const currentDeptId = Number(row.querySelector('.view-dept').dataset.deptId);

  const deptOptions = departmentCache
    .map((d) => `<option value="${d.id}" ${d.id === currentDeptId ? 'selected' : ''}>${d.name}</option>`)
    .join('');

  row.querySelector('.view-code').innerHTML = `<input type="text" class="edit-code" value="${currentCode}" />`;
  row.querySelector('.view-title').innerHTML = `<input type="text" class="edit-title" value="${currentTitle}" />`;
  row.querySelector('.view-credits').innerHTML = `<input type="number" step="0.5" class="edit-credits" value="${currentCredits}" />`;
  row.querySelector('.view-dept').innerHTML = `<select class="edit-dept">${deptOptions}</select>`;

  const actionsCell = row.children[5];
  actionsCell.innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadCourses()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const code = row.querySelector('.edit-code').value.trim();
  const title = row.querySelector('.edit-title').value.trim();
  const creditHours = row.querySelector('.edit-credits').value;
  const departmentId = row.querySelector('.edit-dept').value;

  try {
    await updateCourseRequest(id, { code, title, creditHours, departmentId });
    showSuccess('Course updated.');
    loadCourses();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this course?')) return;
  try {
    await deleteCourseRequest(id);
    showSuccess('Course deleted.');
    loadCourses();
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    await loadDepartmentOptions();
    await loadCourses();
  } catch (err) {
    showError(err.message);
  }
})();
