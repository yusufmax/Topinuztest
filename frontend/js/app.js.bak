/**
 * Ho.uz – Frontend Application
 * All pages share this single JS file.
 * Routes: index.html | shops.html | login.html | admin.html
 */

const API = '';          // same origin — backend serves frontend statically
const TOKEN_KEY = 'houz_token';
let currentLang = localStorage.getItem('houz_lang') || 'uz';

const i18n = {
  uz: {
    home: "Bosh sahifa",
    allShops: "Barcha do'konlar",
    hammasi: "Hammasi",
    shopsCount: "Dokonlar",
    filter: "Filter",
    searchPlaceholder: "Do'kon, manzil yoki kategoriya izlash...",
    share: "Ulashish",
    directions: "Yo'nalish",
    close: "Yopish",
    notFound: "Do'kon topilmadi",
    searchOther: "Boshqa kalit so'z yoki kategoriya tanlang.",
    descPlaceholder: "Ma'lumot kiritilmagan",
    locPlaceholder: "Bosh ofis joylashuvi kiritilmagan",
    // Categories translation mapping
    cat: {
      "furniture": "Mebel",
      "lighting": "Yoritish",
      "art-decor": "San’at va dekor",
      "walls": "Devorlar",
      "floor": "Pol",
      "stone": "Tosh",
      "real-estate": "Eksteryer", // User requested replacement
      "plants": "O‘simliklar",
      "bathroom": "Vannaxona",
      "other": "Boshqa"
    }
  },
  ru: {
    home: "Главная",
    allShops: "Все магазины",
    hammasi: "Все",
    shopsCount: "Магазины",
    filter: "Фильтр",
    searchPlaceholder: "Поиск магазина, адреса или категории...",
    share: "Поделиться",
    directions: "Маршрут",
    close: "Закрыть",
    notFound: "Магазины не найдены",
    searchOther: "Укажите другое ключевое слово или категорию.",
    descPlaceholder: "Информация не предоставлена",
    locPlaceholder: "Адрес главного офиса не предоставлен",
    // Categories translation mapping
    cat: {
      "furniture": "Мебель",
      "lighting": "Освещение",
      "art-decor": "Искусство и декор",
      "walls": "Стены",
      "floor": "Пол",
      "stone": "Камень",
      "real-estate": "Экстерьер", // User requested replacement
      "plants": "Растения",
      "bathroom": "Ванная комната",
      "other": "Другое"
    }
  }
};

const subCategoriesData = {
  "furniture": [
    { slug: 'soft-furniture', name: 'Yumshoq mebel', nameRu: 'Мягкая мебель' },
    { slug: 'cabinet-furniture', name: 'Korpusnaya mebel', nameRu: 'Корпусная мебель' },
    { slug: 'kitchen-furniture', name: 'Oshxona mebeli', nameRu: 'Куханная мебель' },
    { slug: 'bedroom-furniture', name: 'Yotoqxona', nameRu: 'Спальня' },
    { slug: 'outdoor-furniture', name: 'Bog‘ mebeli', nameRu: 'Уличная мебель' },
    { slug: 'tables', name: 'Stollar', nameRu: 'Столы' }
  ],
  "lighting": [
    { slug: 'ceiling-lighting', name: 'Shift chiroqlari', nameRu: 'Потолочное освещение' },
    { slug: 'wall-lighting', name: 'Devor chiroqlari', nameRu: 'Настенное' },
    { slug: 'floor-lighting', name: 'Pol va stol lampalari', nameRu: 'Напольное и настольное' },
    { slug: 'street-lighting', name: 'Tashqi yoritish', nameRu: 'Уличное освещение' },
    { slug: 'tech-lighting', name: 'Texnik yoritish', nameRu: 'Техническое' }
  ],
  "art-decor": [
    { slug: 'wall-decor', name: 'Devor dekori', nameRu: 'Настенный декор' },
    { slug: 'sculptures', name: 'Haykaltaroshlik', nameRu: 'Скульптуры и статуэтки' },
    { slug: 'textile', name: 'To‘qimachilik', nameRu: 'Текстиль' },
    { slug: 'accessories', name: 'Aksessuarlar', nameRu: 'Аксессуары' }
  ],
  "walls": [
    { slug: 'paint', name: 'Bo‘yoqlar', nameRu: 'Краска' },
    { slug: 'wallpaper', name: 'Gulqog‘ozlar', nameRu: 'Обои' },
    { slug: 'panels', name: 'Panellar', nameRu: 'Панели' },
    { slug: 'wall-tiles', name: 'Kafel', nameRu: 'Плитка' }
  ],
  "floor": [
    { slug: 'wood-floor', name: 'Yog‘ochli qoplamalar', nameRu: 'Дерево' },
    { slug: 'laminate', name: 'Laminat va vinil', nameRu: 'Ламинат и винил' },
    { slug: 'floor-tiles', name: 'Kafel', nameRu: 'Плитка' },
    { slug: 'carpet', name: 'Yumshoq qoplamalar', nameRu: 'Ковровые покрытия' }
  ],
  "stone": [
    { slug: 'natural-stone', name: 'Tabiiy tosh', nameRu: 'Натуральный камень' },
    { slug: 'artificial-stone', name: 'Sun’iy tosh', nameRu: 'Искусственный камень' },
    { slug: 'format', name: 'Format', nameRu: 'Формат' }
  ],
  "real-estate": [
    { slug: 'facade', name: 'Fasad materiallari', nameRu: 'Фасадные материалы' },
    { slug: 'roofing', name: 'Krovlya va vodostoki', nameRu: 'Кровля и водостоки' },
    { slug: 'landscape', name: 'Landshaft', nameRu: 'Ландшафтный' },
    { slug: 'pools', name: 'Basseynlar', nameRu: 'Бассейны и водные зоны' },
    { slug: 'fences', name: 'Zaborlar va avtomatik darvozalar', nameRu: 'Заборы и автоматические ворота' },
    { slug: 'facade-lights', name: 'Arxitektura yoritilishi', nameRu: 'Архитектурная подсветка фасада' }
  ],
  "plants": [
    { slug: 'artificial-plants', name: 'Sun’iy o‘simliklar', nameRu: 'Искусственные растения' }
  ],
  "bathroom": [
    { slug: 'plumbing', name: 'Santexnika', nameRu: 'Сантехника' },
    { slug: 'shower', name: 'Dush', nameRu: 'Душ' },
    { slug: 'faucets', name: 'Smesitellar va aksessuarlar', nameRu: 'Смесители и аксессуары' },
    { slug: 'bathroom-furniture', name: 'Vanna mebellari', nameRu: 'Мебель для ванной' }
  ],
  "other": [
    { slug: 'furniture-fittings', name: 'Furnituralar', nameRu: 'Фурнитура' },
    { slug: 'smart-home', name: 'Texnika', nameRu: 'Техника и умный дом' },
    { slug: 'acoustics', name: 'Akustika', nameRu: 'Акустика' }
  ]
};

function t(key) {
  return i18n[currentLang][key] || key;
}

function getCatName(slug) {
  return i18n[currentLang].cat[slug] || slug;
}

function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('houz_lang', lang);
  location.reload(); // Quickest way to re-render all dynamic data and texts
}

/* ──────────────────────────────────────────────────────────
   UTILITIES
────────────────────────────────────────────────────────── */

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

function logoFallback(logoUrl, name) {
  if (logoUrl) {
    return `<img src="${escHtml(logoUrl)}" alt="${escHtml(name)}" 
               onerror="this.replaceWith(document.createTextNode('🏪'))">`;
  }
  // Use first letter as avatar
  const letter = (name || '?').charAt(0).toUpperCase();
  return `<span style="font-size:22px;font-weight:800;color:var(--accent)">${letter}</span>`;
}

/* ──────────────────────────────────────────────────────────
   ROUTER — detect which page we are on
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  const langDropdown = document.getElementById('langDropdown');
  const langOptions = document.querySelectorAll('.lang-option');
  
  // Set initial selected visual in dropdown based on state
  const langTextSpan = document.querySelector('.lang-text');
  if (langTextSpan) langTextSpan.textContent = currentLang.toUpperCase();
  
  langOptions.forEach(opt => {
    if (opt.dataset.lang === currentLang) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
    opt.addEventListener('click', (e) => {
      // Prevent bubbling so it doesn't trigger the body click that closes dropdown
      e.stopPropagation();
      switchLang(opt.dataset.lang);
    });
  });

  if (page === 'index.html' || page === '' || page === '/') {
    initIndexPage();
  } else if (page === 'shops.html') {
    initShopsPage();
  } else if (page === 'login.html') {
    initLoginPage();
  }
  // admin.html boots via inline script (auth guard needed before JS loads shops)
});

/* ══════════════════════════════════════════════════════════
   INDEX PAGE  (index.html)
   – Loads categories from API and renders a grid of cards
   – Each card links to shops.html?category=<slug>
══════════════════════════════════════════════════════════ */

async function initIndexPage() {
  await Promise.all([
    loadCategoriesHome(),
    loadTotalShopCount(),
  ]);
}

async function loadCategoriesHome() {
  const grid = document.getElementById('homeGrid');
  if (!grid) return;

  const categories = [
    { name: 'Furniture',    slug: 'furniture',    image: 'img/Furniture.png' },
    { name: 'Lighting',     slug: 'lighting',     image: 'img/Lighting.png' },
    { name: 'Art & Decor',  slug: 'art-decor',    image: 'img/Art & Decor.png' },
    { name: 'Walls',        slug: 'walls',        image: 'img/Walls.png' },
    { name: 'Floor',        slug: 'floor',        image: 'img/Floor.png' },
    { name: 'Stone',        slug: 'stone',        image: 'img/Stone.png' },
    { name: 'Real Estate',  slug: 'real-estate',  image: 'img/Real Estate.png' },
    { name: 'Plants',       slug: 'plants',       image: 'img/Plants.png' },
    { name: 'Bathroom',     slug: 'bathroom',     image: 'img/Bathroom.png' },
    { name: 'Other',        slug: 'other',        image: 'img/Other.png' },
  ];

  grid.innerHTML = categories.map((cat, i) => `
    <a href="shops.html?category=${encodeURIComponent(cat.slug)}&name=${encodeURIComponent(getCatName(cat.slug))}"
       class="home-card"
       style="animation-delay:${i * 0.05}s">
      <img src="${cat.image}" alt="${escHtml(getCatName(cat.slug))}" class="home-card-img"loading="lazy">
      <span class="home-card-label">${escHtml(getCatName(cat.slug))}</span>
    </a>
  `).join('');
  
  // Update header badge if present
  const countBadge = document.getElementById('shopCountBadge');
  if (countBadge) countBadge.style.display = 'none'; // Hide badge on minimal home
}

async function loadTotalShopCount() {
  const badge = document.getElementById('totalShops');
  if (!badge) return;
  try {
    const res = await fetch(`${API}/api/shops`);
    if (!res.ok) return;
    const shops = await res.json();
    badge.textContent = shops.length;
  } catch { /* keep dash */ }
}

/* ══════════════════════════════════════════════════════════
   SHOPS PAGE  (shops.html)
   – Reads ?category=<slug>&name=<label> from URL
   – Loads all shops, filters by category client-side
   – Builds category tabs from API
   – Renders shop cards with clicking → detail modal
══════════════════════════════════════════════════════════ */

let _allShops = [];
let _activeMainCategory = 'all';
let _activeSubCategory = 'all';

async function initShopsPage() {
  // Read URL params
  const params = new URLSearchParams(window.location.search);
  const catSlug = params.get('category') || 'all';
  // Use dictionary instead of passed name to ensure translation correctness when toggling
  const catName = catSlug === 'all' ? t('allShops') : getCatName(catSlug);

  _activeMainCategory = catSlug;
  _activeSubCategory = 'all';

  // Update page title
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = catName;

  // Fetch shops and build sub-category tabs
  await Promise.all([
    buildCategoryTabs(_activeMainCategory),
    fetchAndRenderShops(_activeMainCategory),
  ]);

  // Search wiring
  const searchInput = document.getElementById('shopSearch');
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fetchAndRenderShops(_activeMainCategory, _activeSubCategory, searchInput.value);
      }, 300); // 300ms debounce for API calls
    });
  }

  // Modal close buttons
  document.getElementById('shopModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('shopModal')) closeShopModal();
  });
  document.getElementById('modalClose')?.addEventListener('click', closeShopModal);
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeShopModal);
}

async function buildCategoryTabs(activeMainSlug) {
  const tabsEl = document.getElementById('catTabs');
  if (!tabsEl) return;

  const subCats = subCategoriesData[activeMainSlug] || [];
  
  if (subCats.length === 0) {
      tabsEl.parentNode.style.display = 'none'; // Hide row if no sub-categories
      return;
  } else {
      tabsEl.parentNode.style.display = 'flex';
  }

  // Prepend "all" (All subcategories of this main category)
  const allTabs = [{ name: t('hammasi'), nameRu: t('hammasi'), slug: 'all' }, ...subCats];

  tabsEl.innerHTML = allTabs.map(cat => {
    const displayName = currentLang === 'ru' && cat.nameRu ? cat.nameRu : (cat.name || cat.nameRu);
    return `
    <button class="cat-pill ${cat.slug === _activeSubCategory ? 'active' : ''}"
            data-slug="${escHtml(cat.slug)}"
            data-name="${escHtml(displayName)}">
      ${escHtml(displayName)}
    </button>
  `}).join('');

  // Tab click
  tabsEl.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeSubCategory = btn.dataset.slug;

      const searchVal = document.getElementById('shopSearch')?.value || '';
      fetchAndRenderShops(_activeMainCategory, _activeSubCategory, searchVal);
    });
  });
}

async function fetchAndRenderShops(activeMainSlug = 'all', activeSubSlug = 'all', searchVal = '') {
  const grid = document.getElementById('shopsGrid');
  if (!grid) return;

  grid.innerHTML = '<div class="loader" id="shopLoader"></div>';

  try {
    let url = `${API}/api/shops`;
    const params = new URLSearchParams();
    
    if (activeMainSlug && activeMainSlug !== 'all') params.append('category', activeMainSlug);
    if (activeSubSlug && activeSubSlug !== 'all') params.append('subcategory', activeSubSlug);
    if (searchVal) params.append('search', searchVal);
    
    const queryStr = params.toString();
    if (queryStr) url += `?${queryStr}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    _allShops = json.data || json || [];
  } catch {
    _allShops = [
      { id: 1, name: 'Kuka Home Mebel',  location: 'Toshkent, Yunusobod',  phone: '+998 90 000 11 22', website: 'https://kuka.uz',     description: 'Zamonaviy va klassik uslubdagi sifatli mebellar.' },
      { id: 2, name: 'Shatura Mebel',    location: 'Toshkent, Chilonzor',  phone: '+998 99 333 44 55', website: 'https://shatura.uz',  description: 'Uyingiz uchun eng yaxshi mebel yechimlari.' },
    ];
  }

  renderShops(_allShops);

  // Deep linking: Check if URL has ?shop=ID and open modal automatically
  const urlParams = new URLSearchParams(window.location.search);
  const shopIdParam = urlParams.get('shop');
  
  if (shopIdParam && !window._shopModalOpened) {
      window._shopModalOpened = true; // Prevent reopening if we filter again
      setTimeout(() => openShopModal(parseInt(shopIdParam)), 100);
  }
}

function renderShops(shops) {
  const grid = document.getElementById('shopsGrid');
  const countEl = document.getElementById('shopCount');
  const pageCountEl = document.getElementById('pageCount');
  if (!grid) return;

  if (countEl) countEl.textContent = `${t('shopsCount')} ${shops.length}`;
  if (pageCountEl) pageCountEl.textContent = `${shops.length} ta`;

  const filterBtn = document.querySelector('.btn-outline-small.btn-filter');
  if(filterBtn) filterBtn.innerHTML = `${t('filter')} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;

  if (shops.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>${t('notFound')}</h3>
        <p>${t('searchOther')}</p>
      </div>`;
    return;
  }

  grid.innerHTML = shops.map((shop, i) => {
    return `
    <div class="market-card" style="animation-delay:${i * 0.05}s"
         onclick="openShopModal(${shop.id})" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')openShopModal(${shop.id})">
      
      <div class="market-logo-box">
        ${logoFallback(shop.logoUrl, shop.name)}
      </div>

      <div class="market-info">
        <div class="market-name">${escHtml(shop.name)}</div>
        <div class="market-desc">${escHtml(shop.description || 'Klassik va zamonaviy uslubdagi sifatli mebellar...')}</div>
      </div>

      <div class="market-chevron">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

    </div>`;
  }).join('');
}

function goExternal(url) {
  if (url) window.open(url, '_blank', 'noopener noreferrer');
}

/* ── Shop Modal ─────────────────────────────────────────── */
function openShopModal(shopId) {
  const shop = _allShops.find(s => s.id === shopId);
  if (!shop) return;

  // Logo
  document.getElementById('modalLogo').innerHTML = logoFallback(shop.logoUrl, shop.name);

  // Info Column
  document.getElementById('modalName').textContent = shop.name;

  const desc = currentLang === 'ru' ? (shop.description_ru || shop.description) : shop.description;
  document.getElementById('modalDescFull').textContent = desc || t('descPlaceholder');

  const loc = shop.location || t('locPlaceholder');
  document.getElementById('modalLocText').textContent = shop.location || t('locPlaceholder');

  // Rows
  const rows = [];
  if (shop.locationLink) {
    const shortLink = shop.locationLink.includes('maps.google') ? 'Google Maps' : (shop.locationLink.includes('yandex') ? 'Yandex Maps' : 'Xarita/Map');
    rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.locationLink)}')" style="cursor:pointer">
      <span class="modal-row-svg" style="font-size: 18px">📍</span>
      <span class="modal-row-text" style="color:var(--accent); text-decoration:underline">${shortLink}</span>
    </div>`);
  }
  if (shop.instagram) {
    const handle = shop.instagram.split('/').pop().replace('?','');
    rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.instagram)}')" style="cursor:pointer">
      <img src="img/icons/instgram%20.svg" class="modal-row-svg" alt="IG">
      <span class="modal-row-text">@${escHtml(handle)}</span>
    </div>`);
  }
  if (shop.telegram) {
    const handle = shop.telegram.split('/').pop();
    rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.telegram)}')" style="cursor:pointer">
      <img src="img/icons/Telegram%20.svg" class="modal-row-svg" alt="TG">
      <span class="modal-row-text">@${escHtml(handle)}</span>
    </div>`);
  }
  if (shop.customLinks) {
    try {
      const links = JSON.parse(shop.customLinks);
      links.forEach(link => {
        rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(link.url)}')" style="cursor:pointer">
          <svg class="modal-row-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span class="modal-row-text">${escHtml(link.label)}</span>
        </div>`);
      });
    } catch(e) { console.error('Error parsing custom links for modal', e); }
  }
  if (shop.website) {
    const host = new URL(shop.website).hostname.replace('www.','');
    rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.website)}')" style="cursor:pointer">
      <img src="img/icons/WebsitegoArrow%20Icon.svg" class="modal-row-svg" alt="Web">
      <span class="modal-row-text">www.${escHtml(host)}</span>
    </div>`);
  }
  if (shop.phone) {
    rows.push(`<a href="tel:${escHtml(shop.phone)}" class="modal-row">
      <img src="img/icons/phone%20icon.svg" class="modal-row-svg" alt="Phone">
      <span class="modal-row-text">${escHtml(shop.phone)}</span>
    </a>`);
  }

  document.getElementById('modalRows').innerHTML = rows.join('');

  // Primary buttons
  const shareBtn = document.getElementById('modalShareBtn');
  const dirBtn = document.getElementById('modalDirectionsBtn');

  if (shareBtn) {
    // Keep icon but update text
    shareBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
      </svg>
      ${t('share')}
    `;
    shareBtn.onclick = async () => {
      const shareCat = shop.Category && shop.Category.slug ? shop.Category.slug : _activeMainCategory;
      const shareUrl = `${window.location.origin}${window.location.pathname}?category=${shareCat}&shop=${shop.id}`;
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast(currentLang === 'ru' ? 'Ссылка скопирована' : 'Havola nusxalandi', 'success');
      } catch (err) {
        showToast('Xatolik yuz berdi', 'error');
      }
    };
  }

  if (dirBtn) {
    dirBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
      </svg>
      ${t('directions')}
    `;
    // Decide which link to open, locationLink > location string search > nothing
    dirBtn.onclick = () => {
      if (shop.locationLink) {
        goExternal(shop.locationLink);
      } else if (shop.location) {
        goExternal(`https://maps.google.com/?q=${encodeURIComponent(shop.location)}`);
      } else {
        showToast(currentLang === 'ru' ? 'Маршрут не найден' : "Manzil kiritilmagan", 'error');
      }
    };
  }

  const overlay = document.getElementById('shopModal');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeShopModal() {
  const overlay = document.getElementById('shopModal');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeShopModal();
    closeShopForm();
  }
});

/* ══════════════════════════════════════════════════════════
   LOGIN PAGE  (login.html)
══════════════════════════════════════════════════════════ */

function initLoginPage() {
  // If already logged in, skip to admin
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
        window.location.href = 'admin.html';
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

/* ══════════════════════════════════════════════════════════
   ADMIN PAGE  (admin.html)
   – adminLoadShops, openShopForm, saveShop, editShop, deleteShop
══════════════════════════════════════════════════════════ */

let _adminShops = [];

async function adminLoadShops() {
  const catGrid = document.getElementById('adminCatGrid');
  if (!catGrid) return;

  try {
    // Admin Global Data
    window._adminCategories = [];
    window._adminSubCategories = [];

    const [shopsRes, catsRes, subcatsRes] = await Promise.all([
      fetch(`${API}/api/shops`),
      fetch(`${API}/api/categories`),
      fetch(`${API}/api/subcategories`)
    ]);
    
    if (!shopsRes.ok) throw new Error();
    const shopsJson = await shopsRes.json();
    _adminShops = shopsJson.data || shopsJson || [];

    if (catsRes.ok) window._adminCategories = (await catsRes.json()).data || [];
    if (subcatsRes.ok) window._adminSubCategories = (await subcatsRes.json()).data || [];
  } catch {
    catGrid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Ошибка подключения</h3>
      <p>Не удалось получить данные с сервера.</p>
    </div>`;
    return;
  }

  // Pre-render Category Grid
  renderAdminCategories();
}

function renderAdminCategories() {
    const catGrid = document.getElementById('adminCatGrid');
    if (!catGrid || !window._adminCategories) return;

    if (window._adminCategories.length === 0) {
        catGrid.innerHTML = `<div class="empty-state"><p>Категории не найдены.</p></div>`;
        return;
    }

    catGrid.innerHTML = window._adminCategories.map(cat => {
        // Count shops in this category
        const count = _adminShops.filter(s => s.CategoryId === cat.id).length;
        const nameRu = i18n.ru.cat[cat.slug] || cat.name;

        // Try to pick an icon or fallback
        const icon = cat.icon || '📁'; // In our public UI we had SVG data, but for admin a simple emoji fallback is fine.

        return `
        <div class="admin-cat-card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;" onclick="showAdminShopsView(${cat.id}, '${escHtml(nameRu)}')">
                <div class="admin-cat-info" style="flex: 1;">
                    <div class="admin-cat-icon">${icon}</div>
                    <div class="admin-cat-text">
                        <h3 style="margin:0">${escHtml(nameRu)}</h3>
                        <p style="margin: 4px 0 0 0;">${count} магазинов</p>
                    </div>
                </div>
                <div class="admin-cat-chevron">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
                 <button type="button" class="btn-edit" onclick="event.stopPropagation(); window.showFiltersView(${cat.id}, '${escHtml(nameRu)}')" style="font-size: 13px; padding: 6px 12px;">Filtrlarni Boshqarish</button>
            </div>
        </div>
        `;
    }).join('');
}

let _currentAdminCategoryId = null;

window.showAdminCategoryView = () => {
    _currentAdminCategoryId = null;
    document.getElementById('adminShopsView').style.display = 'none';
    const filtersView = document.getElementById('adminFiltersView');
    if(filtersView) filtersView.style.display = 'none';
    document.getElementById('adminCategoryView').style.display = 'block';
    
    // Refresh counts in case a shop was added/deleted
    renderAdminCategories();
};

window.showAdminShopsView = (categoryId, categoryName) => {
    _currentAdminCategoryId = categoryId;
    document.getElementById('adminCategoryView').style.display = 'none';
    const filtersView = document.getElementById('adminFiltersView');
    if(filtersView) filtersView.style.display = 'none';
    
    const shopsView = document.getElementById('adminShopsView');
    shopsView.style.display = 'block';
    
    // Update title
    document.getElementById('adminShopsTitle').textContent = categoryName || 'Магазины';
    
    const tbody = document.getElementById('adminTableBody');
    const filteredShops = _adminShops.filter(s => s.CategoryId === categoryId);

    if (filteredShops.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:40px">В этой категории пока нет магазинов.</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredShops.map(shop => `
    <tr>
      <td class="td-name">${escHtml(shop.name)}</td>
      <td class="td-location">${escHtml(shop.location || '–')}</td>
      <td class="td-phone">${shop.phone
        ? `<a href="tel:${escHtml(shop.phone)}">${escHtml(shop.phone)}</a>`
        : '–'}</td>
      <td>${escHtml((shop.Category ? i18n[currentLang].cat[shop.Category.slug] || shop.Category.name : null) || shop.category || shop.categorySlug || '–')}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="editShop(${shop.id})">✏️ Редактировать</button>
          <button class="btn-delete" onclick="deleteShop(${shop.id}, '${escHtml(shop.name)}')">🗑️ Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openShopForm(shop = null) {
  const overlay = document.getElementById('shopFormOverlay');
  const title = document.getElementById('formTitle');
  if (!overlay) return;

  // Reset form
  document.getElementById('shopId').value = shop?.id || '';
  document.getElementById('fName').value = shop?.name || '';
  document.getElementById('fLocation').value = shop?.location || '';
  document.getElementById('fLocationLink').value = shop?.locationLink || '';
  document.getElementById('fPhone').value = shop?.phone || '';
  document.getElementById('fWebsite').value = shop?.website || '';
  document.getElementById('fInstagram').value = shop?.instagram || '';
  document.getElementById('fTelegram').value = shop?.telegram || '';
  document.getElementById('fLogoUrl').value = shop?.logoUrl || '';
  document.getElementById('fDescription').value = shop?.description || '';

  // Handle Dynamic Custom Links
  const linksContainer = document.getElementById('customLinksContainer');
  if (linksContainer) {
    linksContainer.innerHTML = ''; // Clear old rows
    if (shop?.customLinks) {
      try {
        const links = JSON.parse(shop.customLinks);
        links.forEach(link => window.addCustomLinkRow(link.label, link.url));
      } catch(e) { console.error('Error parsing custom links', e); }
    }
  }
  
  const descRuInput = document.getElementById('fDescriptionRu');
  if (descRuInput) descRuInput.value = shop?.description_ru || '';

  // Setup Categories
  const catSelect = document.getElementById('fCategory');
  if (catSelect) {
      catSelect.innerHTML = '<option value="">Выберите...</option>' + window._adminCategories.map(c => 
          `<option value="${c.id}">${escHtml(i18n.ru.cat[c.slug] || c.name)}</option>`
      ).join('');
      catSelect.value = shop?.CategoryId || '';
  }

  // Handle SubCategories
  if (shop?.CategoryId) {
      const existingSubIds = shop?.SubCategories ? shop.SubCategories.map(sc => String(sc.id)) : [];
      window.adminCategoryChanged(shop.CategoryId, existingSubIds);
  } else {
      const subSelect = document.getElementById('fSubCategory');
      if (subSelect) {
          subSelect.innerHTML = '<span class="sub-pill-msg">Выберите категорию...</span>';
          subSelect.style.borderColor = ''; // reset any validation errors
          subSelect.style.border = 'none';
      }
  }

  // Handle Logo UI Drop Zone
  const dropZone = document.getElementById('logoDropZone');
  if (dropZone) {
      if (shop?.logoUrl) {
          dropZone.innerHTML = `<img src="${escHtml(shop.logoUrl)}" alt="Logo">
                                <input type="file" id="fLogoFile" accept="image/png, image/jpeg, image/svg+xml">`;
      } else {
          dropZone.innerHTML = `<span id="logoDropText">📁 Перетащите логотип сюда или нажмите</span>
                                <input type="file" id="fLogoFile" accept="image/png, image/jpeg, image/svg+xml">`;
      }
      _initDropZoneUI();
  }

  title.textContent = shop ? 'Редактировать магазин' : 'Добавить магазин';
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // If we are currently inside a specific category view, pre-select it when adding a new shop
  if (!shop && _currentAdminCategoryId && catSelect) {
      catSelect.value = _currentAdminCategoryId;
      window.adminCategoryChanged(String(_currentAdminCategoryId));
  }
}

function editShop(shopId) {
  const shop = _adminShops.find(s => s.id === shopId);
  if (shop) openShopForm(shop);
}

function closeShopForm() {
  const overlay = document.getElementById('shopFormOverlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

window.addCustomLinkRow = (label = '', url = '') => {
  const container = document.getElementById('customLinksContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'custom-link-row';
  row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: end; background: var(--surface2); padding: 12px; border-radius: 8px;';
  
  row.innerHTML = `
    <div class="form-row" style="margin: 0;">
        <label style="font-size: 11px;">Название (YouTube, TikTok...)</label>
        <input type="text" class="cl-label" placeholder="YouTube" value="${escHtml(label)}">
    </div>
    <div class="form-row" style="margin: 0;">
        <label style="font-size: 11px;">Ссылка</label>
        <input type="url" class="cl-url" placeholder="https://..." value="${escHtml(url)}">
    </div>
    <button type="button" class="btn-cancel" onclick="this.parentElement.remove()" style="padding: 10px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;" title="Удалить">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--red)"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
    </button>
  `;
  container.appendChild(row);
};

async function saveShop() {
  const id = document.getElementById('shopId').value;
  const name = document.getElementById('fName').value.trim();
  const categoryId = document.getElementById('fCategory').value || null;
  const subCategorySelect = document.getElementById('fSubCategory');
  const activePills = Array.from(subCategorySelect.querySelectorAll('.sub-pill.active'));
  const subCategoryIds = activePills.map(opt => opt.getAttribute('data-value')).filter(val => val);

  if (!name) {
    showToast('❗ Название - обязательное поле', 'error');
    document.getElementById('fName').focus();
    return;
  }

  if (!categoryId) {
    showToast('❗ Категория - обязательное поле', 'error');
    document.getElementById('fCategory').style.borderColor = 'red';
    document.getElementById('fCategory').focus();
    return;
  } else {
    document.getElementById('fCategory').style.borderColor = '';
  }
  
  // If the category was selected but no pills chosen, show error
  // Wait, if length === 0, but are there pills available to click?
  const hasPills = subCategorySelect.querySelectorAll('.sub-pill').length > 0;
  if (categoryId && hasPills && subCategoryIds.length === 0) {
    showToast('❗ Подкатегория - обязательное поле', 'error');
    subCategorySelect.style.border = '1px solid red';
    subCategorySelect.style.borderRadius = 'var(--radius-sm)';
    return;
  } else {
    subCategorySelect.style.border = 'none'; // clear error
  }

  // Extract custom links
  const customLinks = [];
  const linkRows = document.querySelectorAll('.custom-link-row');
  for (let i = 0; i < linkRows.length; i++) {
    const label = linkRows[i].querySelector('.cl-label').value.trim();
    const url = linkRows[i].querySelector('.cl-url').value.trim();
    if (label && !url || !label && url) {
        showToast('❗ Заполните оба поля (Название и Ссылка) для всех дополнительных ссылок', 'error');
        return;
    }
    if (label && url) {
        customLinks.push({ label, url });
    }
  }

  const payload = {
    name,
    location:    document.getElementById('fLocation').value.trim(),
    locationLink: document.getElementById('fLocationLink').value.trim(),
    phone:       document.getElementById('fPhone').value.trim(),
    website:     document.getElementById('fWebsite').value.trim(),
    instagram:   document.getElementById('fInstagram').value.trim(),
    telegram:    document.getElementById('fTelegram').value.trim(),
    customLinks: JSON.stringify(customLinks),
    logoUrl:     document.getElementById('fLogoUrl').value.trim(),
    description: document.getElementById('fDescription').value.trim(),
    description_ru: document.getElementById('fDescriptionRu') ? document.getElementById('fDescriptionRu').value.trim() : '',
    CategoryId:  categoryId,
    subCategoryIds: subCategoryIds,
  };

  const isEdit = !!id;
  const url    = isEdit ? `${API}/api/shops/${id}` : `${API}/api/shops`;
  const method = isEdit ? 'PUT' : 'POST';

  const btn = document.querySelector('.btn-save');
  btn.textContent = 'Сохранение…';
  btn.disabled = true;

  try {
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      },
      body: JSON.stringify(payload),
    });

    if (handle401(res)) return;
    if (!res.ok) throw new Error(await res.text());

    showToast(isEdit ? '✅ Успешно обновлено' : '✅ Магазин добавлен', 'success');
    closeShopForm();
    await adminLoadShops();

    // Refresh currently visible view
    if (_currentAdminCategoryId) {
        const cat = window._adminCategories.find(c => c.id === _currentAdminCategoryId);
        const cName = cat ? (i18n.ru.cat[cat.slug] || cat.name) : 'Магазины';
        showAdminShopsView(_currentAdminCategoryId, cName);
    } else {
        renderAdminCategories();
    }
  } catch (err) {
    showToast('❌ Произошла ошибка: ' + err.message, 'error');
  } finally {
    btn.textContent = 'Сохранить';
    btn.disabled = false;
  }
}

async function deleteShop(shopId, name) {
  if (!confirm(`Вы уверены, что хотите удалить магазин "${name}"?`)) return;

  try {
    const res = await fetch(`${API}/api/shops/${shopId}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
    });
    if (handle401(res)) return;
    if (!res.ok) throw new Error('Delete failed');
    showToast('🗑️ Магазин удален', 'success');
    
    // Remove locally immediately for snappy UI
    _adminShops = _adminShops.filter(s => s.id !== shopId);
    
    // Refresh currently visible view
    if (_currentAdminCategoryId) {
        const cat = window._adminCategories.find(c => c.id === _currentAdminCategoryId);
        const cName = cat ? (i18n.ru.cat[cat.slug] || cat.name) : 'Магазины';
        showAdminShopsView(_currentAdminCategoryId, cName);
    } else {
        renderAdminCategories();
    }
  } catch {
    showToast('❌ Ошибка при удалении', 'error');
  }
}

function adminLogout() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = 'login.html';
}

/* ══════════════════════════════════════════════════════════
   LANGUAGE SWITCHER
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const langWrap = document.getElementById('langWrap');
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');

  if (langWrap && langBtn && langDropdown) {
      langBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          langDropdown.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
          if (!langWrap.contains(e.target)) {
              langDropdown.classList.remove('active');
          }
      });

      const options = langDropdown.querySelectorAll('.lang-option');
      options.forEach(opt => {
          opt.addEventListener('click', (e) => {
               // Visual selection update
               options.forEach(o => o.classList.remove('selected'));
               opt.classList.add('selected');

               // Close dropdown
               langDropdown.classList.remove('active');

               // Update button text
               const lang = opt.getAttribute('data-lang');
               const textSpan = langBtn.querySelector('.lang-text');
               if(textSpan) textSpan.textContent = lang.toUpperCase();

               // console.log('Language changed to:', lang);
          });
      });
  }
});

/* ══════════════════════════════════════════════════════════
   ADMIN HELPERS (UPLOAD & CATEGORY DROPDOWN)
══════════════════════════════════════════════════════════ */
window.adminCategoryChanged = (categoryId, selectedSubIds = []) => {
    const subSelect = document.getElementById('fSubCategory');
    if (!subSelect) return;

    if (!categoryId) {
        subSelect.innerHTML = '<span class="sub-pill-msg">Выберите категорию...</span>';
        return;
    }

    const filtered = (window._adminSubCategories || []).filter(sc => String(sc.CategoryId) === String(categoryId));
    if (filtered.length === 0) {
        subSelect.innerHTML = '<span class="sub-pill-msg">В этой категории нет подкатегорий</span>';
    } else {
        // Find RU name from our local data map
        const getRuName = (slug, defaultName) => {
            for (const cat in subCategoriesData) {
                const found = subCategoriesData[cat].find(s => s.slug === slug);
                if (found && found.nameRu) return found.nameRu;
            }
            return defaultName;
        };

        subSelect.innerHTML = filtered.map(sc => {
            const isActive = selectedSubIds && selectedSubIds.includes(String(sc.id)) ? 'active' : '';
            return `<div class="sub-pill ${isActive}" data-value="${sc.id}" onclick="this.classList.toggle('active')">${escHtml(getRuName(sc.slug, sc.name))}</div>`;
        }).join('');
    }
};

function _initDropZoneUI() {
    const dropZone = document.getElementById('logoDropZone');
    const fileInput = document.getElementById('fLogoFile');
    if (!dropZone || !fileInput) return;

    const prevent = e => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => dropZone.addEventListener(evt, prevent));

    ['dragenter', 'dragover'].forEach(evt => dropZone.addEventListener(evt, () => dropZone.classList.add('dragover')));
    ['dragleave', 'drop'].forEach(evt => dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover')));

    dropZone.addEventListener('drop', e => {
        const file = e.dataTransfer.files[0];
        if (file) _handleLogoUpload(file);
    });

    fileInput.addEventListener('change', e => {
        if (e.target.files[0]) _handleLogoUpload(e.target.files[0]);
    });
}

window._handleLogoUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
        showToast('❗ Можно загружать только изображения', 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showToast('❗ Размер изображения должен быть меньше 2МБ', 'error');
        return;
    }

    const dropZone = document.getElementById('logoDropZone');
    dropZone.innerHTML = `<span id="logoDropText">⏳ Загрузка...</span>`;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${API}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
            body: formData
        });
        if (handle401(res)) return;
        if (!res.ok) throw new Error('Upload error');
        const json = await res.json();
        
        if (!json.success) throw new Error(json.message);
        
        const imgUrl = json.data.url;
        document.getElementById('fLogoUrl').value = imgUrl; // Store link to save with shop payload

        // Update UI preview
        dropZone.innerHTML = `<img src="${imgUrl}" alt="Preview">
                              <input type="file" id="fLogoFile" accept="image/png, image/jpeg, image/svg+xml">`;
        _initDropZoneUI(); // re-bind events
        showToast('🖼️ Логотип загружен!', 'success');
    } catch (err) {
        showToast('❌ Ошибка при загрузке: ' + err.message, 'error');
        dropZone.innerHTML = `<span id="logoDropText">❌ Ошибка. Попробуйте снова.</span>
                              <input type="file" id="fLogoFile" accept="image/png, image/jpeg, image/svg+xml">`;
        _initDropZoneUI();
    }
};
