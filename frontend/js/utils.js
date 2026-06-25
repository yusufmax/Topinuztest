// ─── Theme & UI Style Management ────────────────────────
(function initTheme() {
    const saved = localStorage.getItem('houz_theme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // Default permanently to Apple style & SF Pro font, removing dynamic selectors
    document.documentElement.setAttribute('data-ui-style', 'apple');
    document.documentElement.setAttribute('data-font', 'sf-pro');
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
    fetch('/api/shops/my-location')
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch user location from server proxy');
            return res.json();
        })
        .then(resData => {
            if (resData && resData.success && resData.data && resData.data.latitude && resData.data.longitude) {
                successCallback({
                    coords: {
                        latitude: parseFloat(resData.data.latitude),
                        longitude: parseFloat(resData.data.longitude)
                    }
                });
            } else {
                throw new Error('Invalid coordinates format returned from proxy');
            }
        })
        .catch(err => {
            console.error('IP-based fallback via server proxy failed:', err);
            errorCallback(err);
        });
}
