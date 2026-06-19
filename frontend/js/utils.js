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
    if (savedFont !== 'sf-pro' && savedFont !== 'playfair' && savedFont !== 'inter') {
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
        if (activeFont !== 'sf-pro' && activeFont !== 'playfair' && activeFont !== 'inter') {
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
        
        // Font Dropdown Switcher
        const fontWrapper = document.createElement('div');
        fontWrapper.className = 'font-wrap';
        fontWrapper.id = 'fontWrap';
        fontWrapper.style.cssText = 'margin: 0; position: relative;';
        
        let activeFontName = 'SF Pro';
        if (activeFont === 'playfair') activeFontName = 'Playfair';
        if (activeFont === 'inter') activeFontName = 'Inter';

        fontWrapper.innerHTML = `
            <button class="font-dropdown-btn" id="fontDropdownBtn" aria-label="Change Font">
                <svg class="font-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7"></polyline>
                    <line x1="9" y1="20" x2="15" y2="20"></line>
                    <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
                <span class="font-btn-text" id="fontBtnText">${activeFontName}</span>
                <svg class="font-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="font-dropdown" id="fontDropdown">
                <div class="font-option-item ${activeFont === 'sf-pro' ? 'selected' : ''}" data-font="sf-pro">
                    <span>SF Pro</span>
                    <svg class="font-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="font-option-item ${activeFont === 'playfair' ? 'selected' : ''}" data-font="playfair">
                    <span>Playfair</span>
                    <svg class="font-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="font-option-item ${activeFont === 'inter' ? 'selected' : ''}" data-font="inter">
                    <span>Inter</span>
                    <svg class="font-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
            </div>
        `;
        
        // Append inside footer-controls
        controls.insertBefore(fontWrapper, controls.firstChild);
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

        // Bind Font Dropdown Actions
        const dropdownBtn = fontWrapper.querySelector('#fontDropdownBtn');
        const dropdownMenu = fontWrapper.querySelector('#fontDropdown');
        const arrow = fontWrapper.querySelector('.font-arrow');
        
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownMenu.classList.contains('active');
            
            // Close other dropdowns
            document.querySelectorAll('.lang-dropdown, .font-dropdown').forEach(d => {
                if (d !== dropdownMenu) d.classList.remove('active');
            });
            document.querySelectorAll('.lang-arrow, .font-arrow').forEach(a => {
                if (a !== arrow) a.style.transform = '';
            });
            
            if (!isOpen) {
                dropdownMenu.classList.add('active');
                arrow.style.transform = 'rotate(180deg)';
            } else {
                dropdownMenu.classList.remove('active');
                arrow.style.transform = '';
            }
        });
        
        // Hide dropdown on click outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
            arrow.style.transform = '';
        });
        
        fontWrapper.querySelectorAll('.font-option-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                fontWrapper.querySelectorAll('.font-option-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                const nextFont = item.dataset.font;
                let nextName = 'SF Pro';
                if (nextFont === 'playfair') nextName = 'Playfair';
                if (nextFont === 'inter') nextName = 'Inter';
                
                fontWrapper.querySelector('#fontBtnText').textContent = nextName;
                localStorage.setItem('houz_font', nextFont);
                document.documentElement.setAttribute('data-font', nextFont);
                
                dropdownMenu.classList.remove('active');
                arrow.style.transform = '';
            });
        });
    }
});

function renderRatingStarsHtml(rating, count = 0) {
    const r = parseFloat(rating || 5.0);
    const fullStars = Math.round(r);
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += i <= fullStars ? '★' : '☆';
    }
    return `
        <div class="rating-stars-container" title="Rating: ${r.toFixed(1)} / 5">
            <span class="stars">${starsHtml}</span>
            <span class="rating-value" style="font-weight:700; font-size:13px; margin-left:2px;">${r.toFixed(1)}</span>
            <span class="rating-count">(${count})</span>
        </div>
    `;
}

function extractCoordsFromLink(url) {
    if (!url) return null;
    let match = url.match(/@([0-9]{2}\.[0-9]+),([0-9]{2}\.[0-9]+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

    match = url.match(/(?:place|q|query)=([0-9]{2}\.[0-9]+),([0-9]{2}\.[0-9]+)/i);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

    match = url.match(/ll=([0-9]{2}\.[0-9]+)(?:%2C|,)([0-9]{2}\.[0-9]+)/i);
    if (match) {
        return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
    }

    match = url.match(/([0-9]{2}\.[0-9]+)\s*,\s*([0-9]{2}\.[0-9]+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

    return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getUserLocation(successCallback, errorCallback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                successCallback(position);
            },
            (error) => {
                console.warn('Browser geolocation failed, attempting IP-based fallback...', error);
                getIpCoordsFallback(successCallback, errorCallback);
            },
            { enableHighAccuracy: true, timeout: 4000 }
        );
    } else {
        getIpCoordsFallback(successCallback, errorCallback);
    }
}

function getIpCoordsFallback(successCallback, errorCallback) {
    fetch('https://freeipapi.com/api/json')
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            if (data && data.latitude && data.longitude) {
                successCallback({
                    coords: {
                        latitude: parseFloat(data.latitude),
                        longitude: parseFloat(data.longitude)
                    }
                });
            } else {
                throw new Error();
            }
        })
        .catch(() => {
            fetch('https://ipapi.co/json/')
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(data => {
                    if (data && data.latitude && data.longitude) {
                        successCallback({
                            coords: {
                                latitude: parseFloat(data.latitude),
                                longitude: parseFloat(data.longitude)
                            }
                        });
                    } else {
                        throw new Error();
                    }
                })
                .catch(err => errorCallback(err));
        });
}
