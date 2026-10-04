const form = document.getElementById('forgotForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  const email = document.getElementById('email').value.trim();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const result = await forgotPasswordRequest(email);
    successMsg.textContent = result.data.message;
    successMsg.style.display = 'block';
    form.reset();
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Reset Link';
  }
});
