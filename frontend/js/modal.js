let _carouselTimer = null;
let _carouselIdx = 0;
let _carouselCount = 0;
let _navigatingToStore = false;
let _modalScrollY = 0;

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
    window._currentOpenShopId = shopId;
    const shop = _allShops.find(s => s.id === shopId);
    if (!shop) return;

    // Logo
    document.getElementById('modalLogo').innerHTML = logoFallback(shop.logoUrl, shop.name);

    // Info Column
    document.getElementById('modalName').textContent = shop.name;

    // Rating
    const ratingContainer = document.getElementById('modalRatingContainer');
    if (ratingContainer) {
      ratingContainer.innerHTML = renderRatingStarsHtml(shop.rating, shop.reviewsCount);
    }

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

    // Load dynamic map
    const mapContainer = document.getElementById('modalMapContainer');
    const mapIframe = document.getElementById('modalMapIframe');
    if (mapContainer && mapIframe) {
      if (shop.location) {
        mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(shop.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        mapContainer.style.display = 'block';
      } else {
        mapIframe.src = '';
        mapContainer.style.display = 'none';
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
        
        // Lock background scroll
        _modalScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${_modalScrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Reset sheet layout and scroll position
        const sheet = document.getElementById('modalSheet');
        if (sheet) {
            sheet.classList.remove('expanded');
        }
        
        const modalBody = overlay.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        _navigatingToStore = false;

        // Reset reviews form
        selectedModalRating = 5;
        const authorInput = document.getElementById('modalReviewAuthor');
        const commentInput = document.getElementById('modalReviewComment');
        if (authorInput) authorInput.value = '';
        if (commentInput) commentInput.value = '';
        const starSelector = document.getElementById('modalStarSelector');
        if (starSelector) {
            const stars = starSelector.querySelectorAll('span');
            stars.forEach(s => {
                s.textContent = parseInt(s.dataset.val) <= 5 ? '★' : '☆';
                s.classList.add('selected');
            });
        }

        // Load reviews list
        loadModalReviews(shop.id);

        // Fetch and render the store's products inside the bottom sheet
        _loadModalProducts(shop.id, shop.slug, shop.name, shop.currency || 'UZS');
    }
}

async function _loadModalProducts(shopId, shopSlug, shopName, shopCurrency) {
    const container = document.getElementById('modalProductsSection');
    const grid = document.getElementById('modalProductsGrid');
    if (!container || !grid) return;

    container.style.display = 'block';
    // Render placeholders
    grid.innerHTML = Array(4).fill().map(() => `
        <div class="skeleton-card" style="height: 220px; border-radius: var(--radius); background: var(--surface2); animation: pulse 1.5s infinite; opacity: 0.6;"></div>
    `).join('');

    try {
        const res = await fetch(`/api/shops/${shopId}/products?limit=24`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const products = json.data || [];

        if (products.length === 0) {
            container.style.display = 'none';
            return;
        }

        grid.innerHTML = products.map(prod => {
            const hasAr = prod.glbUrl || prod.usdzUrl;
            const arBadge = hasAr ? `
                <div class="product-card-ar-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 17 12 22 12"></polyline>
                    </svg>
                    3D / AR
                </div>
            ` : '';

            const currency = shopCurrency || 'UZS';
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
                <a href="/stores/${shopSlug}/products/${prod.slug}" class="product-card" style="margin: 0;">
                    <div class="product-card-img-wrap">
                        <img src="${cloudinaryOptimize(imageUrl)}" alt="${escHtml(prod.name)}" class="product-card-img" loading="lazy">
                        ${arBadge}
                    </div>
                    <div class="product-card-content">
                        <span class="product-card-shop">${escHtml(shopName)}</span>
                        <h3 class="product-card-name" style="font-size: 13px; height: 34px; line-height: 1.3;">${escHtml(prod.name)}</h3>
                        <div class="product-card-price-row">
                            <span class="product-card-price" style="font-size: 13px; ${prod.salePrice ? 'color: var(--red);' : ''}">${displayPriceStr}</span>
                            ${oldPriceHtml}
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (e) {
        console.error('Error loading modal products:', e);
        container.style.display = 'none';
    }
}

function closeShopModal(immediate = false) {
    window._currentOpenShopId = null;
    _stopCarousel();
    const overlay = document.getElementById('shopModal');
    const sheet = document.getElementById('modalSheet');
    
    // Unlock background scroll helper
    const unlockBody = () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.scrollTo(0, _modalScrollY);
    };

    if (overlay) {
        if (immediate) {
            overlay.style.display = 'none';
            overlay.classList.remove('closing');
            if (sheet) {
                sheet.classList.remove('expanded');
                sheet.style.transform = '';
                sheet.style.transition = '';
            }
            unlockBody();
            return;
        }

        if (overlay.classList.contains('closing')) return;

        overlay.classList.add('closing');
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('closing');
            if (sheet) {
                sheet.classList.remove('expanded');
                sheet.style.transform = '';
                sheet.style.transition = '';
            }
            unlockBody();
        }, 280);
    }
}

// Close with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShopModal();
      if (typeof closeShopForm === 'function') closeShopForm();
    }
});

// Auto-expand/collapse bottom sheet on mobile scroll & swipe down to close
function initModalScrollRedirect() {
    const overlay = document.getElementById('shopModal');
    const modalBody = document.querySelector('#shopModal .modal-body');
    const sheet = document.getElementById('modalSheet');
    if (modalBody && sheet && overlay) {
        let lastScrollTopTime = 0;

        modalBody.addEventListener('scroll', () => {
            if (modalBody.scrollTop > 0) {
                lastScrollTopTime = Date.now();
            }
            // Check if mobile view (e.g. width < 600px)
            if (window.innerWidth < 600) {
                if (modalBody.scrollTop > 15) {
                    sheet.classList.add('expanded');
                } else if (modalBody.scrollTop <= 0) {
                    sheet.classList.remove('expanded');
                }
            }
        });

        // Touch swipe-down to close on mobile
        let startY = 0;
        let dragStartY = 0;
        let isDraggingSheet = false;
        let startedAtTop = false;

        overlay.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startedAtTop = (modalBody.scrollTop <= 0);
        }, { passive: true });

        overlay.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const dy = currentY - startY;

            const isBody = e.target.closest('.modal-body');
            const isBackdrop = e.target === overlay;
            const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;

            // If touch starts outside modal-body (e.g. header, handle, backdrop), block background scrolling
            if (!isBody) {
                if ((isBackdrop || (startedAtTop && modalBody.scrollTop <= 0)) && dy > 0) {
                    if (!isDraggingSheet) {
                        isDraggingSheet = true;
                        dragStartY = currentY;
                    }
                }

                if (isDraggingSheet) {
                    const dragDistance = currentY - dragStartY;
                    if (dragDistance > 0) {
                        sheet.style.transform = `translateY(${dragDistance}px)`;
                        sheet.style.transition = 'none';
                    } else {
                        sheet.style.transform = '';
                        isDraggingSheet = false;
                    }
                }
                if (e.cancelable) e.preventDefault();
                return;
            }

            // Inside modal-body
            if ((startedAtTop && modalBody.scrollTop <= 0) && dy > 0) {
                if (!isDraggingSheet) {
                    isDraggingSheet = true;
                    dragStartY = currentY;
                }
            }

            if (isDraggingSheet) {
                const dragDistance = currentY - dragStartY;
                if (dragDistance > 0) {
                    sheet.style.transform = `translateY(${dragDistance}px)`;
                    sheet.style.transition = 'none';
                    if (e.cancelable) e.preventDefault();
                } else {
                    sheet.style.transform = '';
                    isDraggingSheet = false;
                }
            } else if (!isScrollable) {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        overlay.addEventListener('touchend', (e) => {
            if (isDraggingSheet) {
                isDraggingSheet = false;
                sheet.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

                const endY = e.changedTouches[0] ? e.changedTouches[0].clientY : startY;
                const dragDistance = endY - dragStartY;

                if (dragDistance > 100) {
                    sheet.style.transform = 'translateY(100%)';
                    overlay.classList.add('closing');
                    setTimeout(() => {
                        closeShopModal(true);
                    }, 300);
                } else {
                    sheet.style.transform = '';
                    setTimeout(() => {
                        sheet.style.transition = '';
                    }, 300);
                }
            }
            startY = 0;
            dragStartY = 0;
            startedAtTop = false;
        }, { passive: true });

        // Scroll wheel / trackpad close on desktop when at the top (avoiding inertial scroll artifacts)
        overlay.addEventListener('wheel', (e) => {
            const isBody = e.target.closest('.modal-body');
            if (isBody) {
                const timeSinceScroll = Date.now() - lastScrollTopTime;
                if (modalBody.scrollTop <= 0 && e.deltaY < -5 && timeSinceScroll > 200) {
                    closeShopModal();
                    return;
                }
                
                // Prevent background scroll chain propagation
                const isScrollingUp = e.deltaY < 0;
                const isScrollingDown = e.deltaY > 0;
                const isAtTop = modalBody.scrollTop <= 0;
                const isAtBottom = modalBody.scrollHeight - modalBody.clientHeight - modalBody.scrollTop <= 1;

                if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
                    if (e.cancelable) e.preventDefault();
                }
            } else {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });
    }
}

let selectedModalRating = 5;

function setupModalStarSelector() {
    const stars = document.querySelectorAll('#modalStarSelector span');
    if (stars.length === 0) return;

    function updateStarsVisuals(rating) {
        stars.forEach(s => {
            const val = parseInt(s.dataset.val);
            if (val <= rating) {
                s.textContent = '★';
                s.classList.add('selected');
            } else {
                s.textContent = '☆';
                s.classList.remove('selected');
            }
        });
    }

    // Default
    updateStarsVisuals(5);

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const hoverVal = parseInt(star.dataset.val);
            stars.forEach(s => {
                const val = parseInt(s.dataset.val);
                s.classList.toggle('hovered', val <= hoverVal);
            });
        });

        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });

        star.addEventListener('click', () => {
            selectedModalRating = parseInt(star.dataset.val);
            updateStarsVisuals(selectedModalRating);
        });
    });
}

async function loadModalReviews(shopId) {
    const listEl = document.getElementById('modalReviewsList');
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text3);">${currentLang === 'ru' ? '⏳ Загрузка отзывов...' : '⏳ Fikrlar yuklanmoqda...'}</div>`;

    try {
        const res = await fetch(`/api/shops/${shopId}/reviews`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const reviews = json.data || [];

        if (reviews.length === 0) {
            listEl.innerHTML = `<div class="empty-reviews">${t('noReviewsYet')}</div>`;
            return;
        }

        listEl.innerHTML = reviews.map(r => {
            const dateStr = new Date(r.createdAt).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += i <= r.rating ? '★' : '☆';
            }

            return `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-author">${escHtml(r.authorName)}</span>
                        <span class="review-date">${dateStr}</span>
                    </div>
                    <div class="review-stars">${starsHtml}</div>
                    <p class="review-comment">${escHtml(r.comment)}</p>
                </div>
            `;
        }).join('');
    } catch (err) {
        listEl.innerHTML = `<div style="color:var(--red); text-align:center;">${currentLang === 'ru' ? 'Ошибка загрузки отзывов.' : 'Fikrlar yuklashda xatolik.'}</div>`;
    }
}

async function submitModalReview(event) {
    event.preventDefault();
    const shopId = window._currentOpenShopId;
    if (!shopId) return;

    const authorInput = document.getElementById('modalReviewAuthor');
    const commentInput = document.getElementById('modalReviewComment');
    const btnSubmit = document.querySelector('#modalReviewForm button[type="submit"]');

    if (!commentInput.value.trim()) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = '...';

    try {
        const res = await fetch(`/api/shops/${shopId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorName: authorInput.value.trim() || 'Гость',
                comment: commentInput.value.trim(),
                rating: selectedModalRating
            })
        });

        if (!res.ok) throw new Error();
        
        // Clear form
        authorInput.value = '';
        commentInput.value = '';
        selectedModalRating = 5;
        const starSelector = document.getElementById('modalStarSelector');
        if (starSelector) {
            const stars = starSelector.querySelectorAll('span');
            stars.forEach(s => {
                s.textContent = parseInt(s.dataset.val) <= 5 ? '★' : '☆';
                s.classList.add('selected');
            });
        }

        showToast(t('reviewSuccess'), 'success');

        // Collapse the form on success
        const form = document.getElementById('modalReviewForm');
        const icon = document.getElementById('modalReviewToggleIcon');
        if (form) form.style.display = 'none';
        if (icon) icon.textContent = '➕';

        // Reload shop in local list to update average rating on shops page
        const shopRes = await fetch(`/api/shops/${shopId}`);
        if (shopRes.ok) {
            const updatedShop = (await shopRes.json()).data;
            if (typeof _allShops !== 'undefined' && Array.isArray(_allShops)) {
                const idx = _allShops.findIndex(s => s.id === shopId);
                if (idx !== -1) {
                    _allShops[idx] = updatedShop;
                }
                // Re-render shop listing cards on market directory page if function exists
                if (typeof renderShops === 'function') {
                    renderShops(_allShops);
                }
            }
            // Update modal header rating
            const ratingContainer = document.getElementById('modalRatingContainer');
            if (ratingContainer) {
                ratingContainer.innerHTML = renderRatingStarsHtml(updatedShop.rating, updatedShop.reviewsCount);
            }
        }
        
        await loadModalReviews(shopId);
    } catch (err) {
        showToast('Ошибка при отправке отзыва', 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = t('submitReviewBtn');
    }
}

function toggleModalReviewForm() {
    const form = document.getElementById('modalReviewForm');
    const icon = document.getElementById('modalReviewToggleIcon');
    if (form.style.display === 'none') {
        form.style.display = 'flex';
        icon.textContent = '➖';
    } else {
        form.style.display = 'none';
        icon.textContent = '➕';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initModalScrollRedirect();
        setupModalStarSelector();
    });
} else {
    initModalScrollRedirect();
    setupModalStarSelector();
}

window.addEventListener('langchange', () => {
    const modal = document.getElementById('shopModal');
    if (modal && (modal.style.display === 'block' || modal.style.display === 'flex') && window._currentOpenShopId) {
        openShopModal(window._currentOpenShopId);
    }
});
