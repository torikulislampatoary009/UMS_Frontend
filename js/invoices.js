renderShell({ active: 'invoices', title: 'Invoices & Payments', subtitle: 'Generate invoices and record student payments' });

const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('invoiceTableBody');
const generateForm = document.getElementById('generateForm');
const genStudent = document.getElementById('genStudent');
const genSemester = document.getElementById('genSemester');
const detailSection = document.getElementById('detailSection');
const detailTitle = document.getElementById('detailTitle');
const paymentForm = document.getElementById('paymentForm');
const paymentTableBody = document.getElementById('paymentTableBody');

let currentInvoiceId = null;

function showError(m) { successMsg.style.display='none'; errorMsg.textContent=m; errorMsg.style.display='block'; }
function showSuccess(m) { errorMsg.style.display='none'; successMsg.textContent=m; successMsg.style.display='block'; }

function statusBadge(status) {
  const colors = { paid: 'var(--success)', partial: 'var(--gold)', unpaid: 'var(--danger)' };
  return `<span style="color:${colors[status]}; font-weight:600;">${status}</span>`;
}

async function loadDropdowns() {
  const [studentResult, semesterResult] = await Promise.all([getStudents(), getSemesters()]);
  genStudent.innerHTML = studentResult.data.map((s) => `<option value="${s.id}">${s.student_name}</option>`).join('');
  genSemester.innerHTML = semesterResult.data.map((s) => `<option value="${s.id}">${s.name}${s.is_current ? ' (current)' : ''}</option>`).join('');
}

function renderRow(inv) {
  const tr = document.createElement('tr');
  tr.dataset.id = inv.id;
  tr.innerHTML = `
    <td>${inv.student_name}</td>
    <td>${inv.semester_name}</td>
    <td>${Number(inv.total_amount).toFixed(2)}</td>
    <td>${Number(inv.paid_amount).toFixed(2)}</td>
    <td>${Number(inv.balance).toFixed(2)}</td>
    <td>${statusBadge(inv.status)}</td>
    <td>${inv.due_date.split('T')[0]}</td>
    <td>
      <button class="btn-small" onclick="openInvoice(${inv.id})">Record Payment</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${inv.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadInvoices() {
  try {
    const result = await getInvoices();
    tableBody.innerHTML = '';
    result.data.forEach((inv) => tableBody.appendChild(renderRow(inv)));
  } catch (err) { showError(err.message); }
}

generateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    studentId: genStudent.value,
    semesterId: genSemester.value,
    dueDate: document.getElementById('genDueDate').value
  };
  try {
    await generateInvoiceRequest(payload);
    showSuccess('Invoice generated.');
    loadInvoices();
  } catch (err) { showError(err.message); }
});

function renderPaymentRow(p) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${p.payment_date.split('T')[0]}</td>
    <td>${Number(p.amount_paid).toFixed(2)}</td>
    <td>${p.method}</td>
    <td>${p.received_by_name || '—'}</td>
    <td>${p.notes || ''}</td>
  `;
  return tr;
}

async function openInvoice(id) {
  try {
    const result = await getInvoiceDetail(id);
    const inv = result.data;
    currentInvoiceId = id;

    detailSection.style.display = 'block';
    detailTitle.textContent = `${inv.student_name} — ${inv.semester_name} (Balance: ${Number(inv.balance).toFixed(2)})`;

    paymentTableBody.innerHTML = '';
    inv.payments.forEach((p) => paymentTableBody.appendChild(renderPaymentRow(p)));

    document.getElementById('payDate').value = new Date().toISOString().split('T')[0];
  } catch (err) { showError(err.message); }
}

paymentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentInvoiceId) return;

  const payload = {
    amountPaid: document.getElementById('payAmount').value,
    paymentDate: document.getElementById('payDate').value,
    method: document.getElementById('payMethod').value,
    notes: document.getElementById('payNotes').value.trim()
  };

  try {
    await recordPaymentRequest(currentInvoiceId, payload);
    showSuccess('Payment recorded.');
    paymentForm.reset();
    await openInvoice(currentInvoiceId);
    await loadInvoices();
  } catch (err) { showError(err.message); }
});

async function handleDelete(id) {
  if (!confirm('Delete this invoice and all its payment records?')) return;
  try {
    await deleteInvoiceRequest(id);
    showSuccess('Invoice deleted.');
    if (currentInvoiceId === id) detailSection.style.display = 'none';
    loadInvoices();
  } catch (err) { showError(err.message); }
}

(async function init() {
  try {
    await loadDropdowns();
    await loadInvoices();
  } catch (err) { showError(err.message); }
})();
