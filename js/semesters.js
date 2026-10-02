// renderShell() rebuilds document.body via innerHTML, so it must run
// before any getElementById calls below.
renderShell({ active: 'semesters', title: 'Semesters', subtitle: 'Academic terms and the current active term' });

const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('semesterTableBody');
const addForm = document.getElementById('addForm');


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

function renderRow(s) {
  const tr = document.createElement('tr');
  tr.dataset.id = s.id;
  tr.innerHTML = `
    <td>${s.id}</td>
    <td class="view-name">${s.name}</td>
    <td class="view-start">${s.start_date.split('T')[0]}</td>
    <td class="view-end">${s.end_date.split('T')[0]}</td>
    <td>${s.is_current ? '✅ Current' : ''}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${s.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${s.id})">Delete</button>
      ${!s.is_current ? `<button class="btn-small" onclick="handleSetCurrent(${s.id})">Set Current</button>` : ''}
    </td>
  `;
  return tr;
}

async function loadSemesters() {
  try {
    const result = await getSemesters();
    tableBody.innerHTML = '';
    result.data.forEach((s) => tableBody.appendChild(renderRow(s)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const startDate = document.getElementById('newStart').value;
  const endDate = document.getElementById('newEnd').value;

  try {
    await createSemesterRequest({ name, startDate, endDate });
    showSuccess(`Semester "${name}" added.`);
    addForm.reset();
    loadSemesters();
  } catch (err) {
    showError(err.message);
  }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentName = row.querySelector('.view-name').textContent;
  const currentStart = row.querySelector('.view-start').textContent;
  const currentEnd = row.querySelector('.view-end').textContent;

  row.querySelector('.view-name').innerHTML = `<input type="text" class="edit-name" value="${currentName}" />`;
  row.querySelector('.view-start').innerHTML = `<input type="date" class="edit-start" value="${currentStart}" />`;
  row.querySelector('.view-end').innerHTML = `<input type="date" class="edit-end" value="${currentEnd}" />`;

  const actionsCell = row.children[5];
  actionsCell.innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadSemesters()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const name = row.querySelector('.edit-name').value.trim();
  const startDate = row.querySelector('.edit-start').value;
  const endDate = row.querySelector('.edit-end').value;

  try {
    await updateSemesterRequest(id, { name, startDate, endDate });
    showSuccess('Semester updated.');
    loadSemesters();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this semester?')) return;
  try {
    await deleteSemesterRequest(id);
    showSuccess('Semester deleted.');
    loadSemesters();
  } catch (err) {
    showError(err.message);
  }
}

async function handleSetCurrent(id) {
  try {
    await setCurrentSemesterRequest(id);
    showSuccess('Current semester updated.');
    loadSemesters();
  } catch (err) {
    showError(err.message);
  }
}

loadSemesters();
