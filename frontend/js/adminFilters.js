window.showFiltersView = (categoryId, categoryName) => {
    _currentAdminCategoryId = categoryId;
    document.getElementById('adminCategoryView').style.display = 'none';
    const shopsView = document.getElementById('adminShopsView');
    if(shopsView) shopsView.style.display = 'none';
    
    const filtersView = document.getElementById('adminFiltersView');
    filtersView.style.display = 'block';
    
    document.getElementById('adminFiltersTitle').textContent = t('filtersTitle') + categoryName;
    
    renderAdminFilters();
};

window.renderAdminFilters = () => {
    const container = document.getElementById('adminFiltersList');
    if (!container || !_currentAdminCategoryId) return;

    let subCats = window._adminSubCategories.filter(sc => String(sc.CategoryId) === String(_currentAdminCategoryId));
    subCats.sort((a,b) => (a.order||0) - (b.order||0));

    if (subCats.length === 0) {
        container.innerHTML = `<div style="text-align:center;color:var(--text3);padding:40px">${t('noFilters')}</div>`;
        return;
    }

    container.innerHTML = subCats.map((sc, index) => `
        <div class="filter-row" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface); border: 1px solid var(--border); margin-bottom: 8px; border-radius: 8px; transition: 0.2s;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button class="btn-icon" onclick="moveFilter(${sc.id}, -1)" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>⬆️</button>
                    <button class="btn-icon" onclick="moveFilter(${sc.id}, 1)" ${index === subCats.length - 1 ? 'disabled style="opacity:0.3"' : ''}>⬇️</button>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center;">
                    <span style="font-weight: 500">${escHtml(sc.name)}${sc.name_ru ? ` / ${escHtml(sc.name_ru)}` : ' <span style="color:var(--red);font-size:11px">(RU yoq)</span>'}</span>
                    <span style="font-size: 11px; color: var(--text3)">ID: ${sc.id} • Slug: ${escHtml(sc.slug)}</span>
                </div>
            </div>
            <div style="display:flex;gap:8px">
                <button class="btn-edit" onclick="editFilter(${sc.id})" style="font-size:13px;padding:6px 12px">${t('edit')}</button>
                <button class="btn-delete" onclick="deleteFilter(${sc.id}, '${escHtml(sc.name)}')">${t('delete')}</button>
            </div>
        </div>
    `).join('');
};

window.addFilterPrompt = async () => {
    const name = prompt("Введите название фильтра на узбекском (UZ):\nНапример: 'Devorlar uchun qogʻoz'");
    if (!name || !name.trim()) return;

    const nameRu = prompt("Введите название фильтра на русском (RU):\nНапример: 'Обои'");

    const slug = prompt("Введите системный ключ латиницей (например: 'wallpaper'):");
    if (!slug || !slug.trim()) return;

    try {
        const res = await fetch(`${API}/api/subcategories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify({
                name: name.trim(),
                name_ru: nameRu ? nameRu.trim() : null,
                slug: slug.trim().toLowerCase(),
                CategoryId: _currentAdminCategoryId,
                order: window._adminSubCategories.length
            })
        });

        if (handle401(res)) return;
        if (!res.ok) throw new Error('Filter creation failed');
        
        const newCat = await res.json();
        window._adminSubCategories.push(newCat.data);
        showToast(t('filterAdded'), 'success');
        renderAdminFilters();
    } catch (e) {
        showToast(t('addFilterError'), 'error');
    }
};

window.editFilter = async (id) => {
    const sc = window._adminSubCategories.find(s => s.id === id);
    if (!sc) return;

    const newName = prompt("Nomi (UZ):", sc.name);
    if (newName === null) return;

    const newNameRu = prompt("Русское название (RU):", sc.name_ru || '');
    if (newNameRu === null) return;

    try {
        const res = await fetch(`${API}/api/subcategories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify({ name: newName.trim(), name_ru: newNameRu.trim() || null })
        });
        if (handle401(res)) return;
        if (!res.ok) throw new Error();
        const updated = (await res.json()).data;
        const idx = window._adminSubCategories.findIndex(s => s.id === id);
        if (idx !== -1) window._adminSubCategories[idx] = updated;
        showToast('✅ Saqlandi', 'success');
        renderAdminFilters();
    } catch {
        showToast(t('saveFailed'), 'error');
    }
};

window.deleteFilter = async (id, name) => {
    if(!confirm(`${t('delete')} "${name}"?`)) return;

    try {
        const res = await fetch(`${API}/api/subcategories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });

        if (handle401(res)) return;
        if (!res.ok) throw new Error('Deletion failed');

        window._adminSubCategories = window._adminSubCategories.filter(sc => sc.id !== id);
        showToast(t('filterDeleted'), 'success');
        renderAdminFilters();
    } catch {
        showToast(t('deleteFilterError'), 'error');
    }
};

window.moveFilter = async (id, direction) => {
    let subCats = window._adminSubCategories.filter(sc => String(sc.CategoryId) === String(_currentAdminCategoryId));
    subCats.sort((a,b) => (a.order||0) - (b.order||0));

    const index = subCats.findIndex(sc => sc.id === id);
    if (index === -1) return;

    if (direction === -1 && index > 0) {
        // Swap up
        const target = subCats[index - 1];
        const tempOrder = subCats[index].order || index;
        subCats[index].order = target.order || (index - 1);
        target.order = tempOrder;
    } else if (direction === 1 && index < subCats.length - 1) {
        // Swap down
        const target = subCats[index + 1];
        const tempOrder = subCats[index].order || index;
        subCats[index].order = target.order || (index + 1);
        target.order = tempOrder;
    } else {
        return; // Boundaries
    }

    renderAdminFilters(); // Optimistic rendering

    // Save to server
    try {
        const payload = subCats.map(sc => ({ id: sc.id, order: sc.order }));
        const res = await fetch(`${API}/api/subcategories/reorder`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` 
            },
            body: JSON.stringify(payload)
        });
        
        if (handle401(res)) return;
        if (!res.ok) throw new Error('Reorder failed');
    } catch(e) {
        showToast(t('reorderError'), 'error');
    }
};
