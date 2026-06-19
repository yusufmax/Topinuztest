async function initIndexPage() {
    setupSearch();
    await Promise.all([
        loadCategoriesHome(),
        loadPlatformStats(),
        loadFeaturedStores(),
        loadRecentProducts(),
        loadArProducts()
    ]);
}

async function loadPlatformStats() {
    try {
        const res = await fetch('/api/analytics/public-stats');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const { totalShops, totalProducts, totalArModels } = json.data;
        
        const elShops = document.getElementById('statShopsCount');
        const elProducts = document.getElementById('statProductsCount');
        const elAr = document.getElementById('statArCount');
        
        if (elShops) elShops.textContent = totalShops;
        if (elProducts) elProducts.textContent = totalProducts;
        if (elAr) elAr.textContent = totalArModels;
    } catch (e) {
        console.error('Error loading platform stats:', e);
    }
}

async function loadFeaturedStores() {
    const scrollContainer = document.getElementById('featuredStoresScroll');
    if (!scrollContainer) return;

    try {
        const res = await fetch('/api/shops');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const shops = json.data || [];

        if (shops.length === 0) {
            scrollContainer.innerHTML = '<p style="color:var(--text3);">Магазинов пока нет</p>';
            return;
        }

        // Show up to 8 stores
        scrollContainer.innerHTML = shops.slice(0, 8).map(shop => {
            const logoHtml = shop.logoUrl 
                ? `<img src="${cloudinaryOptimize(shop.logoUrl)}" alt="${escHtml(shop.name)}" class="featured-store-logo">`
                : `<div class="featured-store-logo">🏪</div>`;

            const catName = shop.Category ? (currentLang === 'ru' ? shop.Category.name_ru || shop.Category.name : shop.Category.name || shop.Category.name_ru) : '';

            return `
                <div class="featured-store-card" onclick="location.href='/stores/${shop.slug}'">
                    ${logoHtml}
                    <div class="featured-store-name">${escHtml(shop.name)}</div>
                    ${renderRatingStarsHtml(shop.rating, shop.reviewsCount)}
                    ${catName ? `<span class="featured-store-cat">${escHtml(catName)}</span>` : ''}
                </div>
            `;
        }).join('');
    } catch (e) {
        scrollContainer.innerHTML = '<p style="color:var(--red);">Ошибка загрузки популярных брендов</p>';
    }
}

async function loadRecentProducts() {
    const grid = document.getElementById('recentProductsGrid');
    if (!grid) return;

    try {
        const res = await fetch('/api/products?limit=8');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const products = json.data || [];

        if (products.length === 0) {
            grid.innerHTML = '<p style="color:var(--text3); grid-column: 1/-1; text-align:center;">Новых товаров пока нет</p>';
            return;
        }

        grid.innerHTML = renderProductsGridHtml(products);
    } catch (e) {
        grid.innerHTML = '<p style="color:var(--red); grid-column: 1/-1; text-align:center;">Ошибка загрузки новых поступлений</p>';
    }
}

async function loadArProducts() {
    const grid = document.getElementById('arProductsGrid');
    if (!grid) return;

    try {
        const res = await fetch('/api/products?hasAr=true&limit=8');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const products = json.data || [];

        if (products.length === 0) {
            grid.innerHTML = '<p style="color:var(--text3); grid-column: 1/-1; text-align:center;">Товаров с 3D-моделями пока нет</p>';
            return;
        }

        grid.innerHTML = renderProductsGridHtml(products);
    } catch (e) {
        grid.innerHTML = '<p style="color:var(--red); grid-column: 1/-1; text-align:center;">Ошибка загрузки AR-товаров</p>';
    }
}

function renderProductsGridHtml(products) {
    return products.map(prod => {
        const shop = prod.Shop || {};
        const hasAr = prod.glbUrl || prod.usdzUrl;
        const arBadge = hasAr ? `
            <div class="product-card-ar-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 12 22 12"></polyline></svg>
                3D / AR
            </div>
        ` : '';

        const currency = shop.currency || 'UZS';
        const priceStr = prod.price 
            ? `${parseFloat(prod.price).toLocaleString()} ${currency}`
            : (currentLang === 'ru' ? 'Цена по запросу' : 'Narx soʻrov boʻyicha');
            
        const oldPriceHtml = prod.salePrice
            ? `<span class="product-card-old-price">${parseFloat(prod.price).toLocaleString()} ${currency}</span>`
            : '';
            
        const displayPriceStr = prod.salePrice
            ? `${parseFloat(prod.salePrice).toLocaleString()} ${currency}`
            : priceStr;

        const imageUrl = prod.imageUrl || 'img/placeholder.png';

        return `
            <a href="/stores/${shop.slug}/products/${prod.slug}" class="product-card">
                <div class="product-card-img-wrap">
                    <img src="${cloudinaryOptimize(imageUrl)}" alt="${escHtml(prod.name)}" class="product-card-img" loading="lazy">
                    ${arBadge}
                </div>
                <div class="product-card-content">
                    <span class="product-card-shop">${escHtml(shop.name || '')}</span>
                    <h3 class="product-card-name">${escHtml(prod.name)}</h3>
                    ${renderRatingStarsHtml(prod.rating, prod.reviewsCount)}
                    <div class="product-card-price-row">
                        <span class="product-card-price" style="${prod.salePrice ? 'color: var(--red);' : ''}">${displayPriceStr}</span>
                        ${oldPriceHtml}
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

async function loadCategoriesHome() {
    const grid = document.getElementById('homeGrid');
    if (!grid) return;
  
    // Show skeleton loader first
    grid.innerHTML = Array(10).fill().map(() => `
      <div class="skeleton-home-card">
        <div class="skeleton-home-icon"></div>
        <div class="skeleton-home-text"></div>
      </div>
    `).join('');

    const categoryImages = {
      'furniture':   'img/Furniture.png',
      'lighting':    'img/Lighting.png',
      'art-decor':   'img/Art & Decor.png',
      'walls':       'img/Walls.png',
      'floor':       'img/Floor.png',
      'stone':       'img/Stone.png',
      'real-estate': 'img/Real Estate.png',
      'plants':      'img/Plants.png',
      'bathroom':    'img/Bathroom.png',
      'other':       'img/Other.png',
    };

    const categories = [
      { name: 'Furniture',    slug: 'furniture',    image: categoryImages['furniture'] },
      { name: 'Lighting',     slug: 'lighting',     image: categoryImages['lighting'] },
      { name: 'Art & Decor',  slug: 'art-decor',    image: categoryImages['art-decor'] },
      { name: 'Walls',        slug: 'walls',        image: categoryImages['walls'] },
      { name: 'Floor',        slug: 'floor',        image: categoryImages['floor'] },
      { name: 'Stone',        slug: 'stone',        image: categoryImages['stone'] },
      { name: 'Real Estate',  slug: 'real-estate',  image: categoryImages['real-estate'] },
      { name: 'Plants',       slug: 'plants',       image: categoryImages['plants'] },
      { name: 'Bathroom',     slug: 'bathroom',     image: categoryImages['bathroom'] },
      { name: 'Other',        slug: 'other',        image: categoryImages['other'] },
    ];
  
    await Promise.all(categories.map(cat => new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = cat.image;
    })));

    grid.innerHTML = categories.map(cat => `
      <a href="/shops?category=${encodeURIComponent(cat.slug)}&name=${encodeURIComponent(getCatName(cat.slug))}"
         class="home-card home-card-hidden">
        <img src="${cat.image}" alt="${escHtml(getCatName(cat.slug))}" class="home-card-img" draggable="false" style="pointer-events:none;">
        <span class="home-card-label">${escHtml(getCatName(cat.slug))}</span>
      </a>
    `).join('');

    requestAnimationFrame(() => {
        grid.querySelectorAll('.home-card-hidden').forEach(el => el.classList.remove('home-card-hidden'));
    });
}

function setupSearch() {
    const headerInput = document.getElementById('headerSearchInput');
    const heroInput = document.getElementById('heroSearchInput');
    const heroBtn = document.getElementById('heroSearchBtn');
    
    const homeView = document.getElementById('homeView');
    const searchView = document.getElementById('searchView');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    
    const queryValSpan = document.getElementById('searchQueryVal');
    const countProductsSpan = document.getElementById('searchCountProducts');
    const countShopsSpan = document.getElementById('searchCountShops');
    
    const productsGrid = document.getElementById('searchProductsGrid');
    const shopsGrid = document.getElementById('searchShopsGrid');
    const noResultsMsg = document.getElementById('noResultsMsg');
    
    const tabProducts = document.getElementById('searchTabProducts');
    const tabShops = document.getElementById('searchTabShops');

    // Tab switcher
    tabProducts.addEventListener('click', () => {
        tabProducts.classList.add('active');
        tabShops.classList.remove('active');
        productsGrid.style.display = 'grid';
        shopsGrid.style.display = 'none';
        const btnSearch = document.getElementById('btnNearMeSearch');
        if (btnSearch) btnSearch.style.display = 'none';
    });

    tabShops.addEventListener('click', () => {
        tabShops.classList.add('active');
        tabProducts.classList.remove('active');
        shopsGrid.style.display = 'grid';
        productsGrid.style.display = 'none';
        const btnSearch = document.getElementById('btnNearMeSearch');
        if (btnSearch) btnSearch.style.display = 'flex';
    });

    // Translate search nearMe button on load
    const btnNearSearchInit = document.getElementById('lblNearMeBtnSearch');
    if (btnNearSearchInit) btnNearSearchInit.textContent = t('nearMe');

    // Define near me search action
    window._searchNearMeActive = false;
    window.toggleNearMeFilterSearch = () => {
        const btn = document.getElementById('btnNearMeSearch');
        if (!btn) return;
        
        if (!window._searchNearMeActive) {
            if (navigator.geolocation) {
                showToast(currentLang === 'ru' ? '📍 Определение геопозиции...' : '📍 Geopozitsiyani aniqlash...', 'info');
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        window._userCoords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        window._searchNearMeActive = true;
                        btn.style.background = 'var(--accent)';
                        btn.style.color = '#fff';
                        
                        const query = headerInput?.value || heroInput?.value || '';
                        if (query) performSearch(query);
                        showToast('✅ Список отсортирован по расстоянию', 'success');
                    },
                    (error) => {
                        console.error(error);
                        showToast(currentLang === 'ru' ? '❌ Доступ к геопозиции отклонен' : '❌ Geopozitsiyaga ruxsat rad etildi', 'error');
                    }
                );
            }
        } else {
            window._searchNearMeActive = false;
            btn.style.background = 'var(--surface)';
            btn.style.color = 'var(--text)';
            const query = headerInput?.value || heroInput?.value || '';
            if (query) performSearch(query);
        }
    };

    window._performSearchGlobal = performSearch;

    async function performSearch(query) {
        if (!query) return;
        queryValSpan.textContent = query;
        
        // Sync input values
        if (headerInput) headerInput.value = query;
        if (heroInput) heroInput.value = query;
        
        // Show search view, hide home view
        homeView.style.display = 'none';
        searchView.style.display = 'block';
        
        // Skeletons
        productsGrid.innerHTML = Array(4).fill().map(() => `
            <div class="skeleton-card" style="height:250px;"></div>
        `).join('');
        
        shopsGrid.innerHTML = Array(4).fill().map(() => `
            <div class="skeleton-card" style="height:120px;"></div>
        `).join('');
        
        noResultsMsg.style.display = 'none';
        
        try {
            // Track analytics search event
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'page_view',
                    deviceType: window.innerWidth < 768 ? (window.innerWidth < 480 ? 'mobile' : 'tablet') : 'desktop',
                    referrer: 'search'
                })
            }).catch(() => {});

            // Query backend
            const [prodRes, shopRes] = await Promise.all([
                fetch(`/api/products?search=${encodeURIComponent(query)}&limit=100`),
                fetch(`/api/shops?search=${encodeURIComponent(query)}`)
            ]);
            
            const prodJson = await prodRes.json();
            const shopJson = await shopRes.json();
            
            const products = prodJson.data || [];
            let shops = shopJson.data || [];
            
            // Sort by proximity if Near Me filter is active in search
            if (window._searchNearMeActive && window._userCoords) {
                shops = [...shops].sort((a, b) => {
                    const hasA = a.latitude && a.longitude;
                    const hasB = b.latitude && b.longitude;
                    if (!hasA && !hasB) return 0;
                    if (!hasA) return 1;
                    if (!hasB) return -1;
                    const distA = calculateDistance(window._userCoords.lat, window._userCoords.lng, a.latitude, a.longitude);
                    const distB = calculateDistance(window._userCoords.lat, window._userCoords.lng, b.latitude, b.longitude);
                    return distA - distB;
                });
            }
            
            countProductsSpan.textContent = products.length;
            countShopsSpan.textContent = shops.length;
            
            // Render Products
            if (products.length === 0) {
                productsGrid.innerHTML = '';
            } else {
                productsGrid.innerHTML = renderProductsGridHtml(products);
            }
            
            // Render Shops
            if (shops.length === 0) {
                shopsGrid.innerHTML = '';
            } else {
                shopsGrid.innerHTML = shops.map(shop => {
                    const logoHtml = shop.logoUrl 
                        ? `<img src="${cloudinaryOptimize(shop.logoUrl)}" alt="${escHtml(shop.name)}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">`
                        : `<span style="font-size:24px;">🏪</span>`;
                    
                    const catName = shop.Category ? (currentLang === 'ru' ? shop.Category.name_ru || shop.Category.name : shop.Category.name || shop.Category.name_ru) : '';
                    
                    return `
                        <div class="featured-store-card" onclick="typeof openShopModal === 'function' ? openShopModal(${shop.id}) : location.href='/stores/${shop.slug}'" style="flex:unset; flex-direction:row; text-align:left; justify-content:flex-start; width:100%;">
                            ${logoHtml}
                            <div style="display:flex; flex-direction:column; gap:4px; flex:1; overflow:hidden;">
                                <div class="featured-store-name" style="text-align:left; font-size:16px;">${escHtml(shop.name)}</div>
                                ${renderRatingStarsHtml(shop.rating, shop.reviewsCount)}
                                ${(() => {
                                    if (window._userCoords && shop.latitude && shop.longitude) {
                                        const dist = calculateDistance(window._userCoords.lat, window._userCoords.lng, shop.latitude, shop.longitude);
                                        if (dist !== null) {
                                            const text = t('kmAway').replace('{km}', dist.toFixed(1));
                                            return `<span style="font-size:12px; color:var(--accent); font-weight:700; display:flex; align-items:center; gap:4px; margin-top:4px;">📍 ${text}</span>`;
                                        }
                                    }
                                    return '';
                                })()}
                                ${catName ? `<span class="featured-store-cat" style="align-self:flex-start; margin-top:2px;">${escHtml(catName)}</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            if (products.length === 0 && shops.length === 0) {
                noResultsMsg.style.display = 'block';
            }
        } catch (err) {
            productsGrid.innerHTML = '<p style="color:var(--red);">Ошибка выполнения поиска</p>';
            shopsGrid.innerHTML = '';
        }
    }

    let searchDebounceTimeout;
    function handleSearchInput(val) {
        clearTimeout(searchDebounceTimeout);
        const query = val.trim();
        if (!query) {
            if (headerInput) headerInput.value = '';
            if (heroInput) heroInput.value = '';
            homeView.style.display = 'block';
            searchView.style.display = 'none';
            return;
        }
        searchDebounceTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    }

    function handleSearchImmediate(val) {
        clearTimeout(searchDebounceTimeout);
        const query = val.trim();
        if (!query) {
            homeView.style.display = 'block';
            searchView.style.display = 'none';
            return;
        }
        performSearch(query);
    }

    if (headerInput) {
        headerInput.addEventListener('input', (e) => {
            handleSearchInput(e.target.value);
        });
        headerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearchImmediate(headerInput.value);
        });
    }

    if (heroInput) {
        heroInput.addEventListener('input', (e) => {
            handleSearchInput(e.target.value);
        });
        heroInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearchImmediate(heroInput.value);
        });
    }

    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            handleSearchImmediate(heroInput.value);
        });
    }

    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            if (headerInput) headerInput.value = '';
            if (heroInput) heroInput.value = '';
            homeView.style.display = 'block';
            searchView.style.display = 'none';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'shops.html' || page === 'shops') {
        setupSearch();
    } else if (page === 'index.html' || page === '' || page === '/' || page === 'index') {
        initIndexPage();
    }
});

window.addEventListener('langchange', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'index.html' || page === '' || page === '/' || page === 'index') {
        loadCategoriesHome();
        loadFeaturedStores();
        loadRecentProducts();
        loadArProducts();
    }
    const searchView = document.getElementById('searchView');
    const btnNearSearch = document.getElementById('lblNearMeBtnSearch');
    if (btnNearSearch) btnNearSearch.textContent = t('nearMe');

    if (searchView && searchView.style.display !== 'none' && window._performSearchGlobal) {
        const queryValSpan = document.getElementById('searchQueryVal');
        if (queryValSpan && queryValSpan.textContent) {
            window._performSearchGlobal(queryValSpan.textContent);
        }
    }
});
