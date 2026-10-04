const form = document.getElementById('resetForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const submitBtn = document.getElementById('submitBtn');

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
  errorMsg.textContent = 'No reset token found in the link. Request a new one from the forgot password page.';
  errorMsg.style.display = 'block';
  form.style.display = 'none';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    errorMsg.textContent = 'Passwords do not match.';
    errorMsg.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';

  try {
    const result = await resetPasswordRequest(token, newPassword);
    successMsg.textContent = `${result.data.message} Redirecting to sign in...`;
    successMsg.style.display = 'block';
    form.style.display = 'none';
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Password';
  }
});
