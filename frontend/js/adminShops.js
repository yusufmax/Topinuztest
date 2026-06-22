let _editingShopId = null;
let _galleryImages = [];

function _renderGalleryImages() {
  const section = document.getElementById('gallerySection');
  const list = document.getElementById('galleryImagesList');
  const addBtn = document.getElementById('galleryAddBtn');
  if (!section || !list || !addBtn) return;

  if (!_editingShopId) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  list.innerHTML = _galleryImages.map((img, i) => `
    <div class="gallery-img-item">
      <img src="${escHtml(img.url)}" alt="Фото ${i + 1}">
      <div class="gallery-img-controls">
        <button type="button" title="Влево" ${i === 0 ? 'disabled style="opacity:0.3"' : ''} onclick="_moveGalleryImage(${img.id}, 'prev')">←</button>
        <button type="button" title="Вправо" ${i === _galleryImages.length - 1 ? 'disabled style="opacity:0.3"' : ''} onclick="_moveGalleryImage(${img.id}, 'next')">→</button>
        <button type="button" class="gallery-del-btn" title="Удалить" onclick="_deleteGalleryImage(${img.id})">✕</button>
      </div>
    </div>
  `).join('');

  addBtn.style.display = _galleryImages.length >= 3 ? 'none' : '';
}

window._handleGalleryUpload = async (file) => {
  if (!file.type.startsWith('image/')) { showToast(t('onlyImages'), 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast(t('imageTooLarge'), 'error'); return; }
  if (_galleryImages.length >= 3) { showToast('Максимум 3 фото', 'error'); return; }

  const addBtn = document.getElementById('galleryAddBtn');
  if (addBtn) addBtn.style.opacity = '0.5';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API}/api/shops/${_editingShopId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
      body: formData
    });
    if (handle401(res)) return;
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    _galleryImages.push(json.data);
    _renderGalleryImages();
    showToast('Фото добавлено', 'success');
  } catch (err) {
    showToast('Ошибка загрузки: ' + err.message, 'error');
  } finally {
    if (addBtn) addBtn.style.opacity = '';
  }
};

window._deleteGalleryImage = async (imageId) => {
  if (!confirm('Удалить фото?')) return;
  try {
    const res = await fetch(`${API}/api/shops/${_editingShopId}/images/${imageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
    });
    if (handle401(res)) return;
    if (!res.ok) throw new Error('Delete failed');
    _galleryImages = _galleryImages.filter(img => img.id !== imageId);
    _galleryImages.forEach((img, i) => { img.order = i; });
    _renderGalleryImages();
  } catch (err) {
    showToast('Ошибка удаления', 'error');
  }
};

window._moveGalleryImage = async (imageId, direction) => {
  const idx = _galleryImages.findIndex(img => img.id === imageId);
  if (idx === -1) return;
  const newIdx = direction === 'prev' ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= _galleryImages.length) return;

  [_galleryImages[idx], _galleryImages[newIdx]] = [_galleryImages[newIdx], _galleryImages[idx]];
  _galleryImages.forEach((img, i) => { img.order = i; });
  _renderGalleryImages();

  try {
    await fetch(`${API}/api/shops/${_editingShopId}/images/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      },
      body: JSON.stringify({ ids: _galleryImages.map(img => img.id) })
    });
  } catch (e) {}
};

function openShopForm(shop = null) {
  const overlay = document.getElementById('shopFormOverlay');
  const title = document.getElementById('formTitle');
  if (!overlay) return;

  // Reset form
  document.getElementById('shopId').value = shop?.id || '';
  document.getElementById('fName').value = shop?.name || '';
  document.getElementById('fLocation').value = shop?.location || '';
  document.getElementById('fLocationLink').value = shop?.locationLink || '';
  document.getElementById('fLatitude').value = shop?.latitude || '';
  document.getElementById('fLongitude').value = shop?.longitude || '';
  document.getElementById('fPhone').value = shop?.phone || '';
  document.getElementById('fWebsite').value = shop?.website || '';
  document.getElementById('fInstagram').value = shop?.instagram || '';
  document.getElementById('fTelegram').value = shop?.telegram || '';
  document.getElementById('fLogoUrl').value = shop?.logoUrl || '';
  document.getElementById('fDescription').value = shop?.description || '';
  document.getElementById('fIsActive').checked = shop ? (shop.isActive !== false) : true;

  const storeEnabledCheckbox = document.getElementById('fStoreEnabled');
  const credentialsSection = document.getElementById('vendorCredentialsSection');
  if (storeEnabledCheckbox) {
    storeEnabledCheckbox.checked = shop ? !!shop.storeEnabled : false;
    
    const updateCredsDisplay = () => {
      if (storeEnabledCheckbox.checked && shop?.vendorUsername) {
        document.getElementById('lblVendorUsername').textContent = shop.vendorUsername;
        document.getElementById('lblVendorPassword').textContent = shop.vendorPassword || '–';
        credentialsSection.style.display = 'block';
      } else if (storeEnabledCheckbox.checked && !shop?.vendorUsername) {
        document.getElementById('lblVendorUsername').textContent = '(будет создан при сохранении)';
        document.getElementById('lblVendorPassword').textContent = '(будет создан при сохранении)';
        credentialsSection.style.display = 'block';
      } else {
        credentialsSection.style.display = 'none';
      }
    };

    updateCredsDisplay();
    storeEnabledCheckbox.onchange = updateCredsDisplay;
  }

  // Handle Dynamic Custom Links
  const linksContainer = document.getElementById('customLinksContainer');
  if (linksContainer) {
    linksContainer.innerHTML = '';
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
      catSelect.innerHTML = `<option value="">${t('selectOption')}</option>` + window._adminCategories.map(c =>
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
          subSelect.innerHTML = `<span class="sub-pill-msg">${t('selectCategory')}</span>`;
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
          dropZone.innerHTML = `<span id="logoDropText">${t('dropLogo')}</span>
                                <input type="file" id="fLogoFile" accept="image/png, image/jpeg, image/svg+xml">`;
      }
      _initDropZoneUI();
  }

  // Gallery images
  _editingShopId = shop?.id || null;
  _galleryImages = shop?.ShopImages
    ? [...shop.ShopImages].sort((a, b) => a.order - b.order)
    : [];
  _renderGalleryImages();
  const galleryInput = document.getElementById('galleryFileInput');
  if (galleryInput) {
    galleryInput.onchange = async e => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        if (_galleryImages.length >= 3) { showToast('Максимум 3 фото', 'error'); break; }
        await window._handleGalleryUpload(file);
      }
      e.target.value = '';
    };
  }

  // Auto-extract coordinates from fLocationLink
  const linkInput = document.getElementById('fLocationLink');
  if (linkInput && !linkInput._hasCoordsListener) {
    linkInput._hasCoordsListener = true;
    linkInput.addEventListener('input', (e) => {
        const coords = extractCoordsFromLink(e.target.value);
        if (coords) {
            document.getElementById('fLatitude').value = coords.lat;
            document.getElementById('fLongitude').value = coords.lng;
            showToast('📍 Координаты автоматически извлечены!', 'success');
        }
    });
  }

  title.textContent = shop ? t('editShopTitle') : t('addShopTitle');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Pre-select category if inside one
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
        <label style="font-size: 11px;">${t('linkLabel')}</label>
        <input type="text" class="cl-label" placeholder="YouTube" value="${escHtml(label)}">
    </div>
    <div class="form-row" style="margin: 0;">
        <label style="font-size: 11px;">${t('linkUrl')}</label>
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
    showToast(t('nameRequired'), 'error');
    document.getElementById('fName').focus();
    return;
  }

  if (!categoryId) {
    showToast(t('catRequired'), 'error');
    document.getElementById('fCategory').style.borderColor = 'red';
    document.getElementById('fCategory').focus();
    return;
  } else {
    document.getElementById('fCategory').style.borderColor = '';
  }
  
  const hasPills = subCategorySelect.querySelectorAll('.sub-pill').length > 0;
  if (categoryId && hasPills && subCategoryIds.length === 0) {
    showToast(t('subCatRequired'), 'error');
    subCategorySelect.style.border = '1px solid red';
    subCategorySelect.style.borderRadius = 'var(--radius-sm)';
    return;
  } else {
    subCategorySelect.style.border = 'none';
  }

  const customLinks = [];
  const linkRows = document.querySelectorAll('.custom-link-row');
  for (let i = 0; i < linkRows.length; i++) {
    const label = linkRows[i].querySelector('.cl-label').value.trim();
    const url = linkRows[i].querySelector('.cl-url').value.trim();
    if (label && !url || !label && url) {
        showToast(t('fillBothFields'), 'error');
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
    latitude:     document.getElementById('fLatitude').value ? parseFloat(document.getElementById('fLatitude').value) : null,
    longitude:    document.getElementById('fLongitude').value ? parseFloat(document.getElementById('fLongitude').value) : null,
    phone:       document.getElementById('fPhone').value.trim(),
    website:     document.getElementById('fWebsite').value.trim(),
    instagram:   document.getElementById('fInstagram').value.trim(),
    telegram:    document.getElementById('fTelegram').value.trim(),
    customLinks: JSON.stringify(customLinks),
    logoUrl:     document.getElementById('fLogoUrl').value.trim(),
    description: document.getElementById('fDescription').value.trim(),
    description_ru: document.getElementById('fDescriptionRu') ? document.getElementById('fDescriptionRu').value.trim() : '',
    isActive:    document.getElementById('fIsActive').checked,
    storeEnabled: document.getElementById('fStoreEnabled') ? document.getElementById('fStoreEnabled').checked : false,
    CategoryId:  categoryId,
    subCategoryIds: subCategoryIds,
  };

  const isEdit = !!id;
  const url    = isEdit ? `${API}/api/shops/${id}` : `${API}/api/shops`;
  const method = isEdit ? 'PUT' : 'POST';

  const btn = document.querySelector('.btn-save');
  btn.textContent = t('saving');
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

    showToast(isEdit ? t('updated') : t('shopAdded'), 'success');
    closeShopForm();
    await adminLoadShops();

    if (_currentAdminCategoryId) {
        const cat = window._adminCategories.find(c => c.id === _currentAdminCategoryId);
        const cName = cat ? (i18n[currentLang].cat[cat.slug] || cat.name) : t('shops');
        showAdminShopsView(_currentAdminCategoryId, cName);
    } else {
        renderAdminCategories();
    }
  } catch (err) {
    showToast(t('saveFailed') + err.message, 'error');
  } finally {
    btn.textContent = t('save');
    btn.disabled = false;
  }
}

async function deleteShop(shopId, name) {
  if (!confirm(`${t('delete')} "${name}"?`)) return;

  try {
    const res = await fetch(`${API}/api/shops/${shopId}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
    });
    if (handle401(res)) return;
    if (!res.ok) throw new Error('Delete failed');
    showToast(t('shopDeleted'), 'success');
    
    _adminShops = _adminShops.filter(s => s.id !== shopId);
    
    if (_currentAdminCategoryId) {
        const cat = window._adminCategories.find(c => c.id === _currentAdminCategoryId);
        const cName = cat ? (i18n[currentLang].cat[cat.slug] || cat.name) : t('shops');
        showAdminShopsView(_currentAdminCategoryId, cName);
    } else {
        renderAdminCategories();
    }
  } catch {
    showToast(t('deleteFailed'), 'error');
  }
}

window.adminCategoryChanged = (categoryId, selectedSubIds = []) => {
    const subSelect = document.getElementById('fSubCategory');
    if (!subSelect) return;

    if (!categoryId) {
        subSelect.innerHTML = `<span class="sub-pill-msg">${t('selectCategory')}</span>`;
        return;
    }

    const filtered = (window._adminSubCategories || []).filter(sc => String(sc.CategoryId) === String(categoryId));
    if (filtered.length === 0) {
        subSelect.innerHTML = `<span class="sub-pill-msg">${t('noSubcats')}</span>`;
    } else {
        const getRuName = (sc) => {
            return sc.name_ru || sc.name; // prefer Russian name if available
        };

        subSelect.innerHTML = filtered.map(sc => {
            const isActive = selectedSubIds && selectedSubIds.includes(String(sc.id)) ? 'active' : '';
            return `<div class="sub-pill ${isActive}" data-value="${sc.id}" onclick="this.classList.toggle('active')">${escHtml(getRuName(sc))}</div>`;
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
        showToast(t('onlyImages'), 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showToast(t('imageTooLarge'), 'error');
        return;
    }

    const dropZone = document.getElementById('logoDropZone');
    dropZone.innerHTML = `<span id="logoDropText">${t('uploading')}</span>`;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${API}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
            body: formData
        });
        if (handle401(res)) return;
        if (!res.ok) {
            let errMsg = 'Upload error';
            try {
                const json = await res.json();
                if (json.message) errMsg = json.message;
            } catch (e) {}
            throw new Error(errMsg);
        }
        const json = await res.json();
        
        if (!json.success) throw new Error(json.message);
        
        const imgUrl = json.data.url;
        document.getElementById('fLogoUrl').value = imgUrl; 

        dropZone.innerHTML = `<img src="${imgUrl}" alt="Preview">
                              <input type="file" id="fLogoFile" accept="image/png, image/jpeg, image/svg+xml">`;
        _initDropZoneUI(); 
        showToast(t('logoUploaded'), 'success');
    } catch (err) {
        showToast(t('uploadFailed') + err.message, 'error');
        dropZone.innerHTML = `<span id="logoDropText">${t('uploadError')}</span>
                              <input type="file" id="fLogoFile" accept="image/png, image/jpeg, image/svg+xml">`;
        _initDropZoneUI();
    }
};
