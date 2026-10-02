// renderShell() rebuilds document.body via innerHTML, so it must run
// before any getElementById calls below.
renderShell({ active: 'sections', title: 'Course Sections', subtitle: 'Course offerings per term, with faculty and capacity' });

const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('sectionTableBody');
const addForm = document.getElementById('addForm');
const courseSelect = document.getElementById('newCourse');
const facultySelect = document.getElementById('newFaculty');
const semesterSelect = document.getElementById('newSemester');


let courseCache = [];
let facultyCache = [];
let semesterCache = [];

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

async function loadDropdownData() {
  const [courseResult, facultyResult, semesterResult] = await Promise.all([
    getCourses(), getFaculty(), getSemesters()
  ]);
  courseCache = courseResult.data;
  facultyCache = facultyResult.data;
  semesterCache = semesterResult.data;

  courseSelect.innerHTML = courseCache.map((c) => `<option value="${c.id}">${c.code} - ${c.title}</option>`).join('');
  facultySelect.innerHTML = facultyCache.map((f) => `<option value="${f.id}">${f.faculty_name}</option>`).join('');
  semesterSelect.innerHTML = semesterCache.map((s) => `<option value="${s.id}">${s.name}${s.is_current ? ' (current)' : ''}</option>`).join('');
}

function renderRow(sec) {
  const tr = document.createElement('tr');
  tr.dataset.id = sec.id;
  tr.innerHTML = `
    <td>${sec.id}</td>
    <td class="view-course" data-course-id="${sec.course_id}">${sec.course_code} - ${sec.course_title}</td>
    <td class="view-faculty" data-faculty-id="${sec.faculty_id}">${sec.faculty_name}</td>
    <td class="view-semester" data-semester-id="${sec.semester_id}">${sec.semester_name}</td>
    <td class="view-name">${sec.section_name}</td>
    <td class="view-room">${sec.room || ''}</td>
    <td class="view-capacity">${sec.capacity}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${sec.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${sec.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadSections() {
  try {
    const result = await getSections();
    tableBody.innerHTML = '';
    result.data.forEach((s) => tableBody.appendChild(renderRow(s)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    courseId: courseSelect.value,
    facultyId: facultySelect.value,
    semesterId: semesterSelect.value,
    sectionName: document.getElementById('newSectionName').value.trim(),
    room: document.getElementById('newRoom').value.trim(),
    capacity: document.getElementById('newCapacity').value
  };

  try {
    await createSectionRequest(payload);
    showSuccess('Section added.');
    addForm.reset();
    loadSections();
  } catch (err) {
    showError(err.message);
  }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentCourseId = Number(row.querySelector('.view-course').dataset.courseId);
  const currentFacultyId = Number(row.querySelector('.view-faculty').dataset.facultyId);
  const currentSemesterId = Number(row.querySelector('.view-semester').dataset.semesterId);
  const currentName = row.querySelector('.view-name').textContent;
  const currentRoom = row.querySelector('.view-room').textContent;
  const currentCapacity = row.querySelector('.view-capacity').textContent;

  const courseOptions = courseCache.map((c) => `<option value="${c.id}" ${c.id === currentCourseId ? 'selected' : ''}>${c.code}</option>`).join('');
  const facultyOptions = facultyCache.map((f) => `<option value="${f.id}" ${f.id === currentFacultyId ? 'selected' : ''}>${f.faculty_name}</option>`).join('');
  const semesterOptions = semesterCache.map((s) => `<option value="${s.id}" ${s.id === currentSemesterId ? 'selected' : ''}>${s.name}</option>`).join('');

  row.querySelector('.view-course').innerHTML = `<select class="edit-course">${courseOptions}</select>`;
  row.querySelector('.view-faculty').innerHTML = `<select class="edit-faculty">${facultyOptions}</select>`;
  row.querySelector('.view-semester').innerHTML = `<select class="edit-semester">${semesterOptions}</select>`;
  row.querySelector('.view-name').innerHTML = `<input type="text" class="edit-name" value="${currentName}" style="width:60px;" />`;
  row.querySelector('.view-room').innerHTML = `<input type="text" class="edit-room" value="${currentRoom}" />`;
  row.querySelector('.view-capacity').innerHTML = `<input type="number" class="edit-capacity" value="${currentCapacity}" style="width:70px;" />`;

  const actionsCell = row.children[7];
  actionsCell.innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadSections()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const payload = {
    courseId: row.querySelector('.edit-course').value,
    facultyId: row.querySelector('.edit-faculty').value,
    semesterId: row.querySelector('.edit-semester').value,
    sectionName: row.querySelector('.edit-name').value.trim(),
    room: row.querySelector('.edit-room').value.trim(),
    capacity: row.querySelector('.edit-capacity').value
  };

  try {
    await updateSectionRequest(id, payload);
    showSuccess('Section updated.');
    loadSections();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this section?')) return;
  try {
    await deleteSectionRequest(id);
    showSuccess('Section deleted.');
    loadSections();
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    await loadDropdownData();
    await loadSections();
  } catch (err) {
    showError(err.message);
  }
})();
