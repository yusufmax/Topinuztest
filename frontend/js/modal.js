let _carouselTimer = null;
let _carouselIdx = 0;
let _carouselCount = 0;

function _buildCarousel(images) {
    _stopCarousel();
    const el = document.getElementById('shopCarousel');
    if (!el) return;

    const sorted = [...images].sort((a, b) => a.order - b.order);

    if (!sorted.length) {
        el.innerHTML = '';
        el.style.display = 'none';
        return;
    }

    _carouselCount = sorted.length;
    _carouselIdx = 0;

    const slides = sorted.map((img, i) =>
        `<div class="carousel-slide"><img src="${escHtml(img.url)}" alt="Фото ${i + 1}" loading="lazy"></div>`
    ).join('');

    const dots = sorted.length > 1
        ? `<div class="carousel-dots">${sorted.map((_, i) =>
            `<span class="carousel-dot${i === 0 ? ' active' : ''}"></span>`
          ).join('')}</div>`
        : '';

    el.innerHTML = `<div class="carousel-inner" id="carouselInner">${slides}</div>${dots}`;
    el.style.display = 'block';

    if (sorted.length > 1) {
        _carouselTimer = setInterval(() => {
            _carouselIdx = (_carouselIdx + 1) % _carouselCount;
            _goToSlide(_carouselIdx);
        }, 3000);

        _initCarouselSwipe(el);
    }
}

function _initCarouselSwipe(el) {
    let startX = 0;
    let isDragging = false;

    function resetTimer() {
        if (_carouselTimer) { clearInterval(_carouselTimer); _carouselTimer = null; }
        _carouselTimer = setInterval(() => {
            _carouselIdx = (_carouselIdx + 1) % _carouselCount;
            _goToSlide(_carouselIdx);
        }, 3000);
    }

    // Touch
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 30) return;
        _carouselIdx = dx < 0
            ? (_carouselIdx + 1) % _carouselCount
            : (_carouselIdx - 1 + _carouselCount) % _carouselCount;
        _goToSlide(_carouselIdx);
        resetTimer();
    }, { passive: true });

    // Mouse — listen on document so mouseup fires even outside the element
    el.addEventListener('mousedown', e => {
        startX = e.clientX;
        isDragging = true;
        el.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        el.style.cursor = 'grab';
        const dx = e.clientX - startX;
        if (Math.abs(dx) < 30) return;
        _carouselIdx = dx < 0
            ? (_carouselIdx + 1) % _carouselCount
            : (_carouselIdx - 1 + _carouselCount) % _carouselCount;
        _goToSlide(_carouselIdx);
        resetTimer();
    });

    // Prevent native image drag interfering
    el.querySelectorAll('img').forEach(img => img.addEventListener('dragstart', e => e.preventDefault()));
    el.style.cursor = 'grab';
}

function _goToSlide(idx) {
    const inner = document.getElementById('carouselInner');
    if (inner) inner.style.transform = `translateX(-${idx * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function _stopCarousel() {
    if (_carouselTimer) { clearInterval(_carouselTimer); _carouselTimer = null; }
    _carouselIdx = 0;
    _carouselCount = 0;
}

function openShopModal(shopId) {
    const shop = _allShops.find(s => s.id === shopId);
    if (!shop) return;

    // Logo
    document.getElementById('modalLogo').innerHTML = logoFallback(shop.logoUrl, shop.name);

    // Info Column
    document.getElementById('modalName').textContent = shop.name;

    const desc = currentLang === 'ru' ? shop.description_ru : shop.description;
    document.getElementById('modalDescFull').textContent = desc || t('descPlaceholder');

    document.getElementById('modalLocText').textContent = shop.location || t('locPlaceholder');

    // Make location clickable if a map link exists
    const locEl = document.getElementById('modalLoc');
    if (locEl) {
      if (shop.locationLink) {
        locEl.style.cursor = 'pointer';
        locEl.style.textDecoration = 'none';
        locEl.onclick = () => goExternal(shop.locationLink);
      } else if (shop.location) {
        locEl.style.cursor = 'pointer';
        locEl.style.textDecoration = 'none';
        locEl.onclick = () => goExternal(`https://maps.google.com/?q=${encodeURIComponent(shop.location)}`);
      } else {
        locEl.style.cursor = '';
        locEl.style.textDecoration = '';
        locEl.onclick = null;
      }
    }

    // Store button
    const storeBtn = document.getElementById('modalStoreBtn');
    const storeBtnText = document.getElementById('modalStoreBtnText');
    if (storeBtn && shop.slug) {
      storeBtn.href = `/stores/${shop.slug}`;
      storeBtn.style.display = 'flex';
      if (storeBtnText) {
        storeBtnText.textContent = t('goToStore');
      }
    } else if (storeBtn) {
      storeBtn.style.display = 'none';
    }

    // Rows
    const rows = [];
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
      } catch(e) { showToast(t('copyError'), 'error'); }
    }
    if (shop.website) {
      const host = new URL(shop.website).hostname.replace('www.','');
      rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.website)}')" style="cursor:pointer">
        <img src="img/icons/WebsitegoArrow%20Icon.svg" class="modal-row-svg" alt="Web">
        <span class="modal-row-text">www.${escHtml(host)}</span>
      </div>`);
    }
    if (shop.phone) {
      rows.push(`<div class="modal-row" onclick="window.location.href='tel:${escHtml(shop.phone)}'" style="cursor:pointer">
        <img src="img/icons/phone%20icon.svg" class="modal-row-svg" alt="Phone">
        <span class="modal-row-text">${escHtml(shop.phone)}</span>
      </div>`);
    }

    document.getElementById('modalRows').innerHTML = rows.join('');

    // Carousel
    _buildCarousel(shop.ShopImages || []);

    // Primary buttons
    const shareBtn = document.getElementById('modalShareBtn');
    const dirBtn = document.getElementById('modalDirectionsBtn');

    if (shareBtn) {
      shareBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      `;
      shareBtn.onclick = async () => {
        const shareCat = shop.Category && shop.Category.slug ? shop.Category.slug : _activeMainCategory;
        const shareUrl = `${window.location.origin}${window.location.pathname}?category=${shareCat}&shop=${shop.id}`;
        const shopTitle = shop.name;
        const shopText = shop.name;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shopTitle,
                    text: shopText,
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share error', err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast(t('linkCopied'), 'success');
            } catch (err) {
                showToast(t('copyError'), 'error');
            }
        }
      };
    }

    if (dirBtn) {
      dirBtn.style.display = 'none';
    }

    const overlay = document.getElementById('shopModal');
    if (overlay) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeShopModal() {
    _stopCarousel();
    const overlay = document.getElementById('shopModal');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Close with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShopModal();
      if (typeof closeShopForm === 'function') closeShopForm();
    }
});
