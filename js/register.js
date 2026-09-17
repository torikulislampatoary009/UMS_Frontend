const form = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const registerBtn = document.getElementById('registerBtn');

// Guard: if there's no token at all, send them to login first.
// (This is a UX convenience only — the real enforcement happens
// server-side via verifyToken + requireRole('admin').)
if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  registerBtn.disabled = true;
  registerBtn.textContent = 'Creating...';

  try {
    const result = await registerRequest({ name, email, password, role });

    successMsg.textContent = `Account created: ${result.data.name} (${result.data.role})`;
    successMsg.style.display = 'block';
    form.reset();
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = 'block';
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = 'Create Account';
  }
});
