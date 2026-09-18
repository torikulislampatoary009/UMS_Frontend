const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const loginBtn = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const result = await loginRequest(email, password);

    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));

    successMsg.textContent = `Welcome, ${result.data.user.name} (${result.data.user.role})`;
    successMsg.style.display = 'block';

    // In a full build this would redirect to a role-based dashboard.
    // For now we just confirm the token/user landed correctly.
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = 'block';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
});
