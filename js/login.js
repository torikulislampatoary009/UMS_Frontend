
const form=document.getElementById('loginForm'),errorMsg=document.getElementById('errorMsg'),successMsg=document.getElementById('successMsg'),loginBtn=document.getElementById('loginBtn');
form.addEventListener('submit',async e=>{
 e.preventDefault(); errorMsg.style.display='none'; successMsg.style.display='none'; loginBtn.disabled=true; loginBtn.textContent='Signing in…';
 try{const r=await loginRequest(document.getElementById('email').value.trim(),document.getElementById('password').value);localStorage.setItem('token',r.data.token);localStorage.setItem('user',JSON.stringify(r.data.user));location.href='dashboard.html';}
 catch(err){errorMsg.textContent=err.message;errorMsg.style.display='block';loginBtn.disabled=false;loginBtn.textContent='Sign In';}
});
