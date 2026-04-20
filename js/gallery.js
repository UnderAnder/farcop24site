
    document.addEventListener('DOMContentLoaded', function() {
    // Категории для фильтра
    var mainCategoryNames = { welded: "Приварной шар", bolted: "Прикрутной шар" };
    var portfolioCategoryNames = { A: "Проект A", B: "Проект B" };

    // Собираем все изображения для обеих галерей
    var allGalleryItemsData = { main: [], portfolio: [] };
    function parseAllGalleryLinks() {
    // Новая галерея
    var galleryLinks = document.querySelectorAll('.hidden-gallery-container .gallery-link');
    allGalleryItemsData.main = [];
    galleryLinks.forEach(function(link, idx) {
    var item = {
    src: link.getAttribute('href'),
    w: 0,
    h: 0,
    title: link.getAttribute('data-caption'),
    category: link.getAttribute('data-category'),
    originalIndex: idx
};
    allGalleryItemsData.main.push(item);
    var img = new Image();
    img.src = item.src;
    img.onload = function() { item.w = this.width; item.h = this.height; }
});
    // Портфолио
    var portfolioLinks = document.querySelectorAll('.hidden-portfolio-gallery-container .portfolio-gallery-link');
    allGalleryItemsData.portfolio = [];
    portfolioLinks.forEach(function(link, idx) {
    var item = {
    src: link.getAttribute('href'),
    w: 0,
    h: 0,
    title: link.getAttribute('data-caption'),
    category: link.getAttribute('data-category'),
    originalIndex: idx
};
    allGalleryItemsData.portfolio.push(item);
    var img = new Image();
    img.src = item.src;
    img.onload = function() { item.w = this.width; item.h = this.height; }
});
}

    // Клик по превью
    function setupPreviewClickListeners() {
    document.querySelectorAll('#gallery .main-category-preview .preview-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
    e.preventDefault();
    showGridOverlay('main', this.getAttribute('data-category'));
    if (window.history && window.history.pushState) window.history.pushState({galleryGrid: 'main'}, '', '');
});
});
    document.querySelectorAll('#portfolio-gallery .portfolio-category-preview .preview-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
    e.preventDefault();
    showGridOverlay('portfolio', this.getAttribute('data-category'));
    if (window.history && window.history.pushState) window.history.pushState({galleryGrid: 'portfolio'}, '', '');
});
});
}

    // Показать overlay и grid
    var gridOverlay = document.getElementById('gallery-grid-overlay');
    var gridContent = gridOverlay.querySelector('.grid-content');
    var closeGridBtn = gridOverlay.querySelector('.close-grid-btn');
    var pswpElement = document.querySelector('.pswp');
    var currentGallery = null;
    var currentGridFilter = { main: 'all', portfolio: 'all' };
    var currentGalleryType = null;

    function showGridOverlay(galleryType, scrollToCategory) {
    currentGalleryType = galleryType;
    document.getElementById('main-gallery-filter-bar').style.display = (galleryType === 'main') ? '' : 'none';
    document.getElementById('portfolio-gallery-filter-bar').style.display = (galleryType === 'portfolio') ? '' : 'none';
    var filterBar = gridOverlay.querySelector('.grid-filter-bar#' + (galleryType === 'main' ? 'main-gallery-filter-bar' : 'portfolio-gallery-filter-bar'));
    if (filterBar) {
    filterBar.querySelectorAll('.grid-filter-btn').forEach(btn => btn.classList.remove('active'));
    var btn = filterBar.querySelector('.grid-filter-btn[data-filter="' + scrollToCategory + '"]');
    if (btn) btn.classList.add('active');
    else filterBar.querySelector('.grid-filter-btn[data-filter="all"]').classList.add('active');
}
    buildAndShowGrid(galleryType, scrollToCategory);
}

    function buildAndShowGrid(galleryType, scrollToCategory) {
    gridContent.innerHTML = '';
    var categoryNames = (galleryType === 'main') ? mainCategoryNames : portfolioCategoryNames;
    var itemsData = allGalleryItemsData[galleryType];
    var separatorRefs = {};
    var filterBar = gridOverlay.querySelector('.grid-filter-bar#' + (galleryType === 'main' ? 'main-gallery-filter-bar' : 'portfolio-gallery-filter-bar'));
    var currentFilterBtn = filterBar ? filterBar.querySelector('.grid-filter-btn.active') : null;
    var filter = currentFilterBtn ? currentFilterBtn.getAttribute('data-filter') : 'all';
    currentGridFilter[galleryType] = filter;
    var categories = Object.keys(categoryNames);
    categories.forEach(function(category) {
    if (filter !== 'all' && filter !== category) return;
    var categoryItems = itemsData.filter(item => item.category === category);
    if (categoryItems.length > 0) {
    var separator = document.createElement('div');
    separator.className = 'grid-category-separator';
    separator.textContent = categoryNames[category] || category;
    separator.id = 'grid-cat-' + category;
    gridContent.appendChild(separator);
    separatorRefs[category] = separator;
    categoryItems.forEach(function(item, idx) {
    var thumbDiv = document.createElement('div');
    thumbDiv.className = 'grid-thumbnail';
    thumbDiv.setAttribute('data-index', idx);
    thumbDiv.setAttribute('data-category', category);
    var img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title || categoryNames[category];
    img.loading = 'lazy';
    thumbDiv.appendChild(img);
    gridContent.appendChild(thumbDiv);
    thumbDiv.addEventListener('click', function() {
    var idxInCat = parseInt(this.getAttribute('data-index'));
    if (currentGridFilter[galleryType] === 'all') {
    openPhotoSwipe(itemsData, item.originalIndex);
} else {
    var items = itemsData.filter(i => i.category === currentGridFilter[galleryType]);
    openPhotoSwipe(items, idxInCat);
}
});
});
}
});
    gridOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(function() {
    var thumbs = gridContent.querySelectorAll('.grid-thumbnail');
    thumbs.forEach(function(thumb, i) {
    setTimeout(function() { thumb.classList.add('visible'); }, 60 + i * 40);
});
}, 10);
    if (scrollToCategory && separatorRefs[scrollToCategory]) {
    setTimeout(function() {
    separatorRefs[scrollToCategory].scrollIntoView({behavior: 'smooth', block: 'start'});
}, 100);
}
}

    // Фильтр
    function setupGridFilter() {
    document.querySelectorAll('.grid-filter-bar').forEach(function(filterBar){
    filterBar.addEventListener('click', function(e) {
    if (e.target.classList.contains('grid-filter-btn')) {
    filterBar.querySelectorAll('.grid-filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    var galleryType = e.target.getAttribute('data-gallery');
    buildAndShowGrid(galleryType);
}
});
});
}

    // Закрытие grid
    function setupGridCloseListener() {
    closeGridBtn.addEventListener('click', function() { closeGridOverlay(); });
    gridOverlay.addEventListener('click', function(e) {
    if (e.target === gridOverlay) closeGridOverlay();
});
}
    function closeGridOverlay(popHistory = true) {
    gridOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (popHistory && window.history && window.history.state && window.history.state.galleryGrid) {
    window.history.back();
}
}

    // Открыть PhotoSwipe
    function openPhotoSwipe(items, startIndex) {
    if (!items || items.length === 0) return;
    var options = {
    index: startIndex,
    bgOpacity: 0.9,
    showHideOpacity: false,
    history: false,
    shareEl: false,
    fullscreenEl: true,
    zoomEl: true,
    counterEl: true,
    arrowEl: true,
    captionEl: true,
    closeOnScroll: false,
    closeOnVerticalDrag: true,
    showAnimationDuration: 0,
    hideAnimationDuration: 0,
    getThumbBoundsFn: null,
    mainClass: '',
    loop: true,
    escKey: true,
    arrowKeys: true,
    gettingData: function(index, item) {
    if (!item.w || !item.h) {
    var img = new Image();
    img.onload = function() {
    item.w = this.width;
    item.h = this.height;
    if (currentGallery && currentGallery.currItem.src === item.src) {
    currentGallery.updateSize(true);
}
};
    img.src = item.src;
}
}
};
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
    currentGallery = gallery;
    gallery.listen('close', function() {
    currentGallery = null;
    if (window.history && window.history.state && window.history.state.photoSwipe) {
    window.history.back();
}
});
    if (window.history && window.history.pushState) {
    window.history.pushState({photoSwipe: true}, '', '');
}
    gallery.init();
    closeGridOverlay(false);
}

    // popstate для истории
    window.addEventListener('popstate', function(e) {
    if (currentGallery) { currentGallery.close(); return; }
    if (gridOverlay.classList.contains('active')) { closeGridOverlay(false); return; }
});

    // Инициализация
    parseAllGalleryLinks();
    setupPreviewClickListeners();
    setupGridCloseListener();
    setupGridFilter();
});
