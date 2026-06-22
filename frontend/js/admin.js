let _adminShops = [];
let _currentAdminCategoryId = null;

async function adminLoadShops() {
  const catGrid = document.getElementById('adminCatGrid');
  if (!catGrid) return;

  try {
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

  renderAdminCategories();
}

function renderAdminCategories() {
    const catGrid = document.getElementById('adminCatGrid');
    if (!catGrid || !window._adminCategories) return;

    if (window._adminCategories.length === 0) {
        catGrid.innerHTML = `<div class="empty-state"><p>${t('catsNotFound')}</p></div>`;
        return;
    }

    catGrid.innerHTML = window._adminCategories.map(cat => {
        const count = _adminShops.filter(s => s.CategoryId === cat.id).length;
        const nameRu = i18n.ru.cat[cat.slug] || cat.name;
        const icon = cat.icon || '📁';

        return `
        <div class="admin-cat-card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;" onclick="showAdminShopsView(${cat.id}, '${escHtml(nameRu)}')">
                <div class="admin-cat-info" style="flex: 1;">
                    <div class="admin-cat-icon">${icon}</div>
                    <div class="admin-cat-text">
                        <h3 style="margin:0">${escHtml(nameRu)}</h3>
                        <p style="margin: 4px 0 0 0;">${count} ${t('shopsCountLabel')}</p>
                    </div>
                </div>
                <div class="admin-cat-chevron">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
                 <button type="button" class="btn-edit" onclick="event.stopPropagation(); window.showFiltersView(${cat.id}, '${escHtml(nameRu)}')" style="font-size: 13px; padding: 6px 12px;">${t('manageFilters')}</button>
            </div>
        </div>
        `;
    }).join('');
}

window.showAdminCategoryView = () => {
    _currentAdminCategoryId = null;
    document.getElementById('adminShopsView').style.display = 'none';
    const filtersView = document.getElementById('adminFiltersView');
    if(filtersView) filtersView.style.display = 'none';
    document.getElementById('adminCategoryView').style.display = 'block';
    
    renderAdminCategories();
};

window.showAdminShopsView = (categoryId, categoryName) => {
    _currentAdminCategoryId = categoryId;
    document.getElementById('adminCategoryView').style.display = 'none';
    const filtersView = document.getElementById('adminFiltersView');
    if(filtersView) filtersView.style.display = 'none';
    
    const shopsView = document.getElementById('adminShopsView');
    shopsView.style.display = 'block';
    
    document.getElementById('adminShopsTitle').textContent = categoryName || t('shops');
    
    const tbody = document.getElementById('adminTableBody');
    const filteredShops = _adminShops
        .filter(s => s.CategoryId === categoryId)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    if (filteredShops.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:40px">${t('noShopsInCat')}</td></tr>`;
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
      <td>${shop.isActive !== false ? '<span style="color:var(--green);font-weight:600;">Активен</span>' : '<span style="color:var(--red);font-weight:600;">Приостановлен</span>'}</td>
      <td>
        <div class="action-btns" style="display:flex; gap:8px;">
          ${shop.storeEnabled ? `<button class="btn-edit" onclick="impersonateShop(${shop.id})" style="background:var(--blue); color:white; border:none; padding:4px 8px; border-radius:6px; cursor:pointer;">Войти</button>` : ''}
          <button class="btn-edit" onclick="editShop(${shop.id})">${t('edit')}</button>
          <button class="btn-delete" onclick="deleteShop(${shop.id}, '${escHtml(shop.name)}')">${t('delete')}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.impersonateShop = async (shopId) => {
    try {
        const res = await fetch(`/api/impersonate/${shopId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('houz_token')}`
            }
        });
        if (!res.ok) throw new Error('Failed to impersonate');
        const json = await res.json();
        
        // Save current admin credentials so they can log back in if needed
        localStorage.setItem('admin_token', localStorage.getItem('houz_token'));
        localStorage.setItem('admin_role', localStorage.getItem('houz_role'));
        
        localStorage.setItem('houz_token', json.token);
        localStorage.setItem('houz_role', 'vendor');
        
        showToast('Вход в панель магазина выполнен успешно. Перенаправление...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (err) {
        showToast('Ошибка входа: ' + err.message, 'error');
    }
};

