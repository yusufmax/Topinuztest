function initLoginPage() {
    if (localStorage.getItem(TOKEN_KEY)) {
      window.location.href = 'admin.html';
      return;
    }
  
    const form = document.getElementById('loginForm');
    if (!form) return;
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('loginBtn');
      const errorEl = document.getElementById('loginError');
  
      if (!username || !password) return;
  
      btn.textContent = 'Tekshirilmoqda…';
      btn.disabled = true;
      if (errorEl) errorEl.style.display = 'none';
  
      try {
        const res = await fetch(`${API}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
  
        const data = await res.json();
  
        if (res.ok && data.success && data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
          window.location.href = data.role === 'admin' ? 'admin.html' : 'dashboard';
        } else {
          throw new Error('invalid');
        }
      } catch {
        if (errorEl) errorEl.style.display = 'block';
        btn.textContent = 'Kirish';
        btn.disabled = false;
      }
    });
}
  
function handle401(res) {
    if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        alert("Ваша сессия истекла. Пожалуйста, войдите снова.\n(Sessiya tugadi. Iltimos, qayta kiring.)");
        window.location.href = 'login.html';
        return true;
    }
    return false;
}

function adminLogout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'login.html';
}

// Auto-init on login page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('login.html')) {
        initLoginPage();
    }
});
