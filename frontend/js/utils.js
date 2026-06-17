// ─── Theme & UI Style Management ────────────────────────
(function initTheme() {
    const saved = localStorage.getItem('houz_theme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    let savedStyle = localStorage.getItem('houz_ui_style') || 'glassmorphism';
    if (savedStyle !== 'glassmorphism' && savedStyle !== 'instagram' && savedStyle !== 'apple') {
        savedStyle = 'glassmorphism';
        localStorage.setItem('houz_ui_style', 'glassmorphism');
    }
    document.documentElement.setAttribute('data-ui-style', savedStyle);

    let savedFont = localStorage.getItem('houz_font') || 'sf-pro';
    if (savedFont !== 'sf-pro' && savedFont !== 'playfair' && savedFont !== 'outfit') {
        savedFont = 'sf-pro';
        localStorage.setItem('houz_font', 'sf-pro');
    }
    document.documentElement.setAttribute('data-font', savedFont);
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

// ─── Dynamic UI Style & Font Switcher ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('.footer-controls');
    if (controls) {
        let activeStyle = localStorage.getItem('houz_ui_style') || 'glassmorphism';
        if (activeStyle !== 'glassmorphism' && activeStyle !== 'instagram' && activeStyle !== 'apple') {
            activeStyle = 'glassmorphism';
        }
        
        let activeFont = localStorage.getItem('houz_font') || 'sf-pro';
        if (activeFont !== 'sf-pro' && activeFont !== 'playfair' && activeFont !== 'outfit') {
            activeFont = 'sf-pro';
        }

        // Style Switcher
        const switcher = document.createElement('div');
        switcher.className = 'style-switcher-wrap';
        switcher.innerHTML = `
            <button class="style-switch-btn ${activeStyle === 'instagram' ? 'active' : ''}" data-style="instagram">📸 Instagram</button>
            <button class="style-switch-btn ${activeStyle === 'apple' ? 'active' : ''}" data-style="apple">🍏 Apple</button>
            <button class="style-switch-btn ${activeStyle === 'glassmorphism' ? 'active' : ''}" data-style="glassmorphism">✨ Glass</button>
        `;
        
        // Font Switcher
        const fontSwitcher = document.createElement('div');
        fontSwitcher.className = 'font-switcher-wrap';
        fontSwitcher.innerHTML = `
            <button class="font-switch-btn ${activeFont === 'sf-pro' ? 'active' : ''}" data-font="sf-pro">Aa SF Pro</button>
            <button class="font-switch-btn ${activeFont === 'playfair' ? 'active' : ''}" data-font="playfair">Aa Playfair</button>
            <button class="font-switch-btn ${activeFont === 'outfit' ? 'active' : ''}" data-font="outfit">Aa Outfit</button>
        `;
        
        // Append inside footer-controls
        controls.insertBefore(fontSwitcher, controls.firstChild);
        controls.insertBefore(switcher, controls.firstChild);
        
        // Bind Style Toggles
        switcher.querySelectorAll('.style-switch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switcher.querySelectorAll('.style-switch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const nextStyle = btn.dataset.style;
                localStorage.setItem('houz_ui_style', nextStyle);
                document.documentElement.setAttribute('data-ui-style', nextStyle);
            });
        });

        // Bind Font Toggles
        fontSwitcher.querySelectorAll('.font-switch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                fontSwitcher.querySelectorAll('.font-switch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const nextFont = btn.dataset.font;
                localStorage.setItem('houz_font', nextFont);
                document.documentElement.setAttribute('data-font', nextFont);
            });
        });
    }
});
