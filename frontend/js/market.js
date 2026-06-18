let _allShops = [];
let _activeMainCategory = 'all';
let _activeSubCategory = 'all';
let _liveSubCategories = [];

async function initShopsPage() {
  const params = new URLSearchParams(window.location.search);
  const catSlug = params.get('category') || 'all';
  const catName = catSlug === 'all' ? t('allShops') : getCatName(catSlug);

  _activeMainCategory = catSlug;
  _activeSubCategory = 'all';

  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = catName;

  await Promise.all([
    buildCategoryTabs(_activeMainCategory),
    fetchAndRenderShops(_activeMainCategory),
  ]);



  document.getElementById('shopModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('shopModal')) closeShopModal();
  });
  document.getElementById('modalClose')?.addEventListener('click', closeShopModal);
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeShopModal);
}

async function buildCategoryTabs(activeMainSlug) {
  const tabsEl = document.getElementById('catTabs');
  if (!tabsEl) return;

  // Let's fetch the dynamic subcategories from our new structured backend
  if (_liveSubCategories.length === 0) {
    try {
        const res = await fetch(`${API}/api/subcategories`);
        const json = await res.json();
        _liveSubCategories = json.data;
    } catch (e) {
        console.error("Could not fetch dynamic subcategories", e);
    }
  }

  // Filter subcategories for this specific main category slug
  const mainCategoryIdObj = window._adminCategories ? window._adminCategories.find(c => c.slug === activeMainSlug) : null;
  
  let subCats = [];
  if (mainCategoryIdObj) {
      subCats = _liveSubCategories.filter(sc => String(sc.CategoryId) === String(mainCategoryIdObj.id));
  } else {
      // Fallback to static if backend isn't loaded completely
      subCats = subCategoriesData[activeMainSlug] || [];
  }

  if (subCats.length === 0) {
      tabsEl.parentNode.style.display = 'none';
      return;
  } else {
      tabsEl.parentNode.style.display = 'block';
  }

  const allTabs = [{ name: t('hammasi'), nameRu: t('hammasi'), slug: 'all', id: 'all' }, ...subCats];

  tabsEl.innerHTML = allTabs.map(cat => {
    const displayName = currentLang === 'uz' ? (cat.name || cat.name_ru)
                      : (cat.name_ru || cat.name);
    return `
    <button class="cat-pill ${cat.slug === _activeSubCategory || String(cat.id) === _activeSubCategory ? 'active' : ''}"
            data-slug="${escHtml(cat.slug)}"
            data-id="${cat.id || cat.slug}"
            data-name="${escHtml(displayName)}">
      ${escHtml(displayName)}
    </button>
  `}).join('');

  tabsEl.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeSubCategory = btn.dataset.id; // use ID for filtering backend dynamically
      
      const searchVal = document.getElementById('shopSearch')?.value || '';
      // We pass the actual Main DB Category ID instead of slug to backend
      const mCat = window._adminCategories ? window._adminCategories.find(c => c.slug === _activeMainCategory) : null;
      fetchAndRenderShops(mCat ? mCat.id : _activeMainCategory, _activeSubCategory, searchVal);
    });
  });
}

async function fetchAndRenderShops(activeMainIdOrSlug = 'all', activeSubIdOrSlug = 'all', searchVal = '') {
  const grid = document.getElementById('shopsGrid');
  if (!grid) return;

  grid.innerHTML = Array(6).fill().map(() => `
    <div class="skeleton-card">
      <div class="skeleton-logo"></div>
      <div class="skeleton-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');

  try {
    let url = `${API}/api/shops`;
    const params = new URLSearchParams();
    
    let resolvedMainId = activeMainIdOrSlug;
    if (resolvedMainId && resolvedMainId !== 'all' && isNaN(resolvedMainId)) {
        const mCat = window._adminCategories ? window._adminCategories.find(c => c.slug === resolvedMainId) : null;
        if (mCat) resolvedMainId = mCat.id;
    }

    if (resolvedMainId && resolvedMainId !== 'all') params.append('category', resolvedMainId);
    if (activeSubIdOrSlug && activeSubIdOrSlug !== 'all') params.append('subcategory', activeSubIdOrSlug);
    if (searchVal) params.append('search', searchVal);
    
    const queryStr = params.toString();
    if (queryStr) url += `?${queryStr}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    _allShops = json.data || json || [];
  } catch (err) {
      console.error(err);
      _allShops = [];
  }

  renderShops(_allShops);

  const urlParams = new URLSearchParams(window.location.search);
  const shopIdParam = urlParams.get('shop');
  
  if (shopIdParam && !window._shopModalOpened) {
      window._shopModalOpened = true; 
      setTimeout(() => openShopModal(parseInt(shopIdParam)), 100);
  }
}

function getActiveCategoryName() {
  if (_activeMainCategory === 'all') return t('shopsCount');
  const translated = getCatName(_activeMainCategory);
  // getCatName returns the slug itself if no i18n match — fall back to DB name
  if (translated === _activeMainCategory && window._adminCategories) {
    const cat = window._adminCategories.find(c => c.slug === _activeMainCategory);
    if (cat) return cat.name;
  }
  return translated;
}

function renderShops(shops) {
  const grid = document.getElementById('shopsGrid');
  const countEl = document.getElementById('shopCount');
  const pageCountEl = document.getElementById('pageCount');
  if (!grid) return;

  if (countEl) countEl.textContent = `${getActiveCategoryName()} ${shops.length}`;
  if (pageCountEl) pageCountEl.textContent = `${shops.length} ta`;

  const filterBtn = document.querySelector('.btn-outline-small.btn-filter');
  if(filterBtn) filterBtn.innerHTML = `${t('filter')} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;

  if (shops.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text3); margin: 0 auto 12px; display: block;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3>${t('notFound')}</h3>
        <p>${t('searchOther')}</p>
      </div>`;
    return;
  }

  grid.innerHTML = shops.map(shop => {
    return `
    <div class="market-card market-card-hidden"
         onclick="openShopModal(${shop.id})" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')openShopModal(${shop.id})">

      <div class="market-logo-box">
        ${logoFallback(shop.logoUrl, shop.name)}
      </div>

      <div class="market-info">
        <div class="market-name">${escHtml(shop.name)}</div>
        ${renderRatingStarsHtml(shop.rating, shop.reviewsCount)}
        <div class="market-desc" style="margin-top: 4px;">${escHtml((currentLang === 'ru' ? shop.description_ru : shop.description) || '')}</div>
      </div>

      <div class="market-chevron">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

    </div>`;
  }).join('');

  requestAnimationFrame(() => {
    grid.querySelectorAll('.market-card-hidden').forEach(el => el.classList.remove('market-card-hidden'));
  });
}

function enableDragScroll(el) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let didDrag = false;

    el.addEventListener('mousedown', (e) => {
        isDown = true;
        didDrag = false;
        el.style.cursor = 'grabbing';
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        e.preventDefault();
    });

    el.addEventListener('mouseleave', () => {
        isDown = false;
        el.style.cursor = '';
    });

    el.addEventListener('mouseup', () => {
        isDown = false;
        el.style.cursor = '';
    });

    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - el.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 5) didDrag = true;
        el.scrollLeft = scrollLeft - walk;
    });

    // Block click on children if user dragged (prevents accidental pill activation)
    el.addEventListener('click', (e) => {
        if (didDrag) {
            e.stopPropagation();
            didDrag = false;
        }
    }, true);

    el.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        }
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch categories + subcategories in parallel to reduce load time
    try {
        const [catsRes, subsRes] = await Promise.all([
            fetch(`${API}/api/categories`),
            fetch(`${API}/api/subcategories`),
        ]);
        window._adminCategories = (await catsRes.json()).data || [];
        _liveSubCategories = (await subsRes.json()).data || [];
    } catch(e) {}

    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'shops.html' || page === 'shops') {
        initShopsPage();
        const wrap = document.querySelector('.markets-categories-wrap');
        if (wrap) enableDragScroll(wrap);
    }
});

async function handleLangChangeMarket() {
  const catName = _activeMainCategory === 'all' ? t('allShops') : getCatName(_activeMainCategory);
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = catName;

  await buildCategoryTabs(_activeMainCategory);
  renderShops(_allShops);
}

window.addEventListener('langchange', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'shops.html' || page === 'shops') {
        handleLangChangeMarket();
    }
});
