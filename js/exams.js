// renderShell() rebuilds document.body via innerHTML, so it must run
// before any getElementById calls below.
renderShell({ active: 'exams', title: 'Exams & Grades', subtitle: 'Exams, marks entry, and grade summaries' });

const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const sectionSelect = document.getElementById('sectionSelect');
const sectionFilterForm = document.getElementById('sectionFilterForm');
const addExamForm = document.getElementById('addExamForm');
const examTableBody = document.getElementById('examTableBody');
const rosterSection = document.getElementById('rosterSection');
const rosterTitle = document.getElementById('rosterTitle');
const rosterTableBody = document.getElementById('rosterTableBody');


let currentSectionId = null;

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

async function loadSectionOptions() {
  const result = JSON.parse(localStorage.getItem('user')||'{}').role === 'faculty' ? await getMySections() : await getSections();
  sectionSelect.innerHTML = result.data
    .map((s) => `<option value="${s.id}">${s.course_code} - Sec ${s.section_name} (${s.semester_name})</option>`)
    .join('');
}

function renderExamRow(exam) {
  const tr = document.createElement('tr');
  tr.dataset.id = exam.id;
  tr.innerHTML = `
    <td class="view-type">${exam.exam_type}</td>
    <td class="view-title">${exam.title}</td>
    <td class="view-date">${exam.exam_date.split('T')[0]}</td>
    <td class="view-total">${exam.total_marks}</td>
    <td>
      <button class="btn-small" onclick="openRoster(${exam.id})">Enter Marks</button>
      <button class="btn-small btn-edit" onclick="startEditExam(${exam.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDeleteExam(${exam.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadExams() {
  if (!currentSectionId) return;
  try {
    const result = await getExams(currentSectionId);
    examTableBody.innerHTML = '';
    result.data.forEach((exam) => examTableBody.appendChild(renderExamRow(exam)));
  } catch (err) {
    showError(err.message);
  }
}

sectionFilterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentSectionId = sectionSelect.value;
  rosterSection.style.display = 'none';
  await loadExams();
});

addExamForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentSectionId) {
    showError('Pick a section and click "Load Exams" first.');
    return;
  }

  const payload = {
    sectionId: currentSectionId,
    examType: document.getElementById('newExamType').value,
    title: document.getElementById('newExamTitle').value.trim(),
    examDate: document.getElementById('newExamDate').value,
    totalMarks: document.getElementById('newExamTotal').value
  };

  try {
    await createExamRequest(payload);
    showSuccess('Exam added.');
    addExamForm.reset();
    loadExams();
  } catch (err) {
    showError(err.message);
  }
});

function startEditExam(id) {
  const row = document.querySelector(`#examTableBody tr[data-id="${id}"]`);
  const currentType = row.querySelector('.view-type').textContent;
  const currentTitle = row.querySelector('.view-title').textContent;
  const currentDate = row.querySelector('.view-date').textContent;
  const currentTotal = row.querySelector('.view-total').textContent;

  const typeOptions = ['quiz', 'assignment', 'midterm', 'final']
    .map((t) => `<option value="${t}" ${t === currentType ? 'selected' : ''}>${t}</option>`)
    .join('');

  row.querySelector('.view-type').innerHTML = `<select class="edit-type">${typeOptions}</select>`;
  row.querySelector('.view-title').innerHTML = `<input type="text" class="edit-title" value="${currentTitle}" />`;
  row.querySelector('.view-date').innerHTML = `<input type="date" class="edit-date" value="${currentDate}" />`;
  row.querySelector('.view-total').innerHTML = `<input type="number" step="0.5" class="edit-total" value="${currentTotal}" style="width:70px;" />`;

  row.children[4].innerHTML = `
    <button class="btn-small btn-save" onclick="saveEditExam(${id})">Save</button>
    <button class="btn-small" onclick="loadExams()">Cancel</button>
  `;
}

async function saveEditExam(id) {
  const row = document.querySelector(`#examTableBody tr[data-id="${id}"]`);
  const payload = {
    examType: row.querySelector('.edit-type').value,
    title: row.querySelector('.edit-title').value.trim(),
    examDate: row.querySelector('.edit-date').value,
    totalMarks: row.querySelector('.edit-total').value
  };

  try {
    await updateExamRequest(id, payload);
    showSuccess('Exam updated.');
    loadExams();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDeleteExam(id) {
  if (!confirm('Delete this exam? All marks entered for it will be deleted too.')) return;
  try {
    await deleteExamRequest(id);
    showSuccess('Exam deleted.');
    rosterSection.style.display = 'none';
    loadExams();
  } catch (err) {
    showError(err.message);
  }
}

function renderRosterRow(entry, examId, totalMarks) {
  const tr = document.createElement('tr');
  tr.dataset.enrollmentId = entry.enrollment_id;
  tr.innerHTML = `
    <td>${entry.student_name}</td>
    <td class="view-marks">${entry.obtained_marks !== null ? entry.obtained_marks : '<em style="color:#999;">not entered</em>'}</td>
    <td>
      <input type="number" class="mark-input" min="0" max="${totalMarks}" step="0.5"
             placeholder="/ ${totalMarks}"
             value="${entry.obtained_marks !== null ? entry.obtained_marks : ''}"
             style="width:80px; display:inline-block; margin-bottom:0;" />
      <button class="btn-small btn-save" onclick="handleMarkSave(${examId}, ${entry.enrollment_id})">Save</button>
    </td>
  `;
  return tr;
}

async function openRoster(examId) {
  try {
    const result = await getExamRoster(examId);
    const { exam, roster } = result.data;

    rosterSection.style.display = 'block';
    rosterSection.dataset.examId = examId;
    rosterSection.dataset.totalMarks = exam.total_marks;
    rosterTitle.textContent = `${exam.title} (${exam.exam_type}) — out of ${exam.total_marks}`;

    rosterTableBody.innerHTML = '';
    roster.forEach((entry) => rosterTableBody.appendChild(renderRosterRow(entry, examId, exam.total_marks)));
  } catch (err) {
    showError(err.message);
  }
}

async function handleMarkSave(examId, enrollmentId) {
  const row = document.querySelector(`#rosterTableBody tr[data-enrollment-id="${enrollmentId}"]`);
  const obtainedMarks = row.querySelector('.mark-input').value;

  if (obtainedMarks === '') {
    showError('Enter a mark before saving.');
    return;
  }

  try {
    await markExamGradeRequest(examId, { enrollmentId, obtainedMarks });
    showSuccess('Mark saved.');
    openRoster(examId);
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    await loadSectionOptions();
  } catch (err) {
    showError(err.message);
  }
})();
