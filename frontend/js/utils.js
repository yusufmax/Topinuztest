// ─── Theme Management ──────────────────────────────────
(function initTheme() {
    const saved = localStorage.getItem('houz_theme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('houz_theme', next);
}

function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    clearTimeout(t._tid);
    t._tid = setTimeout(() => { t.className = 'toast'; }, 2800);
}
  
function escHtml(str) {
return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cloudinaryOptimize(url) {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_400/');
}

function logoFallback(logoUrl, name) {
if (logoUrl) {
    const optimizedUrl = cloudinaryOptimize(logoUrl);
    return `<img src="${escHtml(optimizedUrl)}" alt="${escHtml(name)}"
            onerror="this.replaceWith(document.createTextNode('🏪'))">`;
}
const letter = (name || '?').charAt(0).toUpperCase();
return `<span style="font-size:22px;font-weight:800;color:var(--accent)">${letter}</span>`;
}

function getLocalizedText(shop, ruField, defaultField) {
    if (currentLang === 'ru') return shop[ruField] || shop[defaultField] || '';
    return shop[defaultField] || shop[ruField] || '';
}

function goExternal(url) {
    if (url) window.open(url, '_blank', 'noopener noreferrer');
}

// Tap feedback: briefly add .tapped class and remove it immediately on touchend
document.addEventListener('touchstart', (e) => {
    const el = e.target.closest('.market-card, .cat-pill, .home-card');
    if (el) el.classList.add('tapped');
}, { passive: true });

document.addEventListener('touchend', () => {
    document.querySelectorAll('.tapped').forEach(el => el.classList.remove('tapped'));
    // Blur whatever got focus from this tap so mobile browser doesn't keep it "active"
    if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
    }
}, { passive: true });

document.addEventListener('touchcancel', () => {
    document.querySelectorAll('.tapped').forEach(el => el.classList.remove('tapped'));
}, { passive: true });
