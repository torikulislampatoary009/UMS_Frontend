renderShell({ active: 'fee-structures', title: 'Fee Structure', subtitle: 'Fee lines charged per program, per semester' });

const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('feeTableBody');
const addForm = document.getElementById('addForm');
const programSelect = document.getElementById('newProgram');
const semesterSelect = document.getElementById('newSemester');

function showError(m) { successMsg.style.display='none'; errorMsg.textContent=m; errorMsg.style.display='block'; }
function showSuccess(m) { errorMsg.style.display='none'; successMsg.textContent=m; successMsg.style.display='block'; }

async function loadDropdowns() {
  const [programResult, semesterResult] = await Promise.all([getPrograms(), getSemesters()]);
  programSelect.innerHTML = programResult.data.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  semesterSelect.innerHTML = semesterResult.data.map((s) => `<option value="${s.id}">${s.name}${s.is_current ? ' (current)' : ''}</option>`).join('');
}

function renderRow(fs) {
  const tr = document.createElement('tr');
  tr.dataset.id = fs.id;
  tr.innerHTML = `
    <td>${fs.program_name}</td>
    <td>${fs.semester_name}</td>
    <td>${fs.fee_type}</td>
    <td class="view-amount">${Number(fs.amount).toFixed(2)}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${fs.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${fs.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadFeeStructures() {
  try {
    const result = await getFeeStructures();
    tableBody.innerHTML = '';
    result.data.forEach((fs) => tableBody.appendChild(renderRow(fs)));
  } catch (err) { showError(err.message); }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    programId: programSelect.value,
    semesterId: semesterSelect.value,
    feeType: document.getElementById('newFeeType').value,
    amount: document.getElementById('newAmount').value
  };
  try {
    await createFeeStructureRequest(payload);
    showSuccess('Fee line added.');
    addForm.reset();
    loadFeeStructures();
  } catch (err) { showError(err.message); }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentAmount = row.querySelector('.view-amount').textContent;
  row.querySelector('.view-amount').innerHTML = `<input type="number" step="0.01" min="0.01" class="edit-amount" value="${currentAmount}" style="width:100px;" />`;
  row.children[4].innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadFeeStructures()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const amount = row.querySelector('.edit-amount').value;
  try {
    await updateFeeStructureRequest(id, { amount });
    showSuccess('Fee line updated.');
    loadFeeStructures();
  } catch (err) { showError(err.message); }
}

async function handleDelete(id) {
  if (!confirm('Delete this fee line?')) return;
  try {
    await deleteFeeStructureRequest(id);
    showSuccess('Fee line deleted.');
    loadFeeStructures();
  } catch (err) { showError(err.message); }
}

(async function init() {
  try {
    await loadDropdowns();
    await loadFeeStructures();
  } catch (err) { showError(err.message); }
})();
