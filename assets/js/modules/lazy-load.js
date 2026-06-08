var observer;
var loadQueue = [];
var isLoading = false;
var config = {};
var customPlaceholder = '';
var CONCURRENT_LOADS = 3;
var ROOT_MARGIN = '300px';
var isInitialized = false;

export function init() {
  config = getConfig();
  if (config.enable === false) {
    return;
  }
  
  CONCURRENT_LOADS = config.concurrentLoads || 5;
  ROOT_MARGIN = config.rootMargin || '200px';
  customPlaceholder = config.placeholder || '';
  
  setupObserver();
  observeImages();
  isInitialized = true;
}

function getConfig() {
  try {
    if (window.siteConfig && window.siteConfig.lazyLoad) {
      return window.siteConfig.lazyLoad;
    }
  } catch(e) {}
  return { enable: true, placeholder: '', concurrentLoads: 3, rootMargin: '300px' };
}

function setupObserver() {
  if (!('IntersectionObserver' in window)) {
    fallbackLoadAll();
    return;
  }

  observer = new IntersectionObserver(function(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        enqueueLoad(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: ROOT_MARGIN,
    threshold: 0.01
  });
}

function observeImages() {
  var selectors = [
    'img[data-lazy-src]',
    '.article-card .article-image img:not([data-lazy-processed])',
    '.list-item .article-image img:not([data-lazy-processed])',
    '.banner-slide-image:not([data-lazy-processed])',
    '.related-post-cover img:not([data-lazy-processed])',
    '.gallery-item img:not([data-lazy-processed])',
    '.gallery-card img:not([data-lazy-processed])',
    '.widget img:not([data-lazy-processed]):not(.comment-avatar)',
    '.post-content img:not([loading="lazy"]):not([data-lazy-processed])',
    '.article-content img:not([loading="lazy"]):not([data-lazy-processed])'
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((img) => {
      processImage(img);
    });
  });

  // 立即加载已在视口中的图片（解决永不触发 IntersectionObserver 的问题）
  loadVisibleImmediately();

  if (loadQueue.length > 0) {
    processQueue();
  }
}

function loadVisibleImmediately() {
  if (!observer) return;
  loadQueue.slice().forEach(function(img) {
    if (img.closest('.lazy-load-wrapper') &&
        img.getBoundingClientRect) {
      var rect = img.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh + 200 && rect.bottom > -200) {
        var idx = loadQueue.indexOf(img);
        if (idx !== -1) {
          loadQueue.splice(idx, 1);
          observer.unobserve(img);
          loadImage(img, function() {
            isLoading = false;
            processQueue();
          });
        }
      }
    }
  });
}

function processImage(img) {
  if (img.dataset.lazyProcessed === 'true') return;

  // 如果图片已加载完成（浏览器缓存），直接标记完成，不显示骨架屏
  if (img.complete && img.naturalWidth > 0 && img.src && img.src !== 'about:blank') {
    img.classList.add('lazy-loaded');
    return;
  }

  var src = img.dataset.lazySrc || img.src;
  if (!src || src === '' || src === 'about:blank') return;

  img.dataset.lazyProcessed = 'true';
  img.dataset.actualSrc = src;

  if (src && !img.dataset.lazySrc) {
    img.dataset.lazySrc = src;
    img.src = 'about:blank';
  }

  wrapWithSkeleton(img);

  if (observer) {
    observer.observe(img);
  }
}

function wrapWithSkeleton(img) {
  if (img.closest('.lazy-load-wrapper')) return;

  var wrapper = document.createElement('span');
  wrapper.className = 'lazy-load-wrapper' + (customPlaceholder ? ' has-custom-placeholder' : '');
  wrapper.style.display = 'inline-block';
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  wrapper.style.lineHeight = '0';

  var width = img.width || img.offsetWidth || img.naturalWidth || 300;
  var height = img.height || img.offsetHeight || img.naturalHeight || 200;

  if (width > 0) wrapper.style.width = width + 'px';
  if (height > 0) wrapper.style.minHeight = height + 'px';

  if (customPlaceholder) {
    wrapper.style.backgroundImage = "url('" + customPlaceholder + "')";
    wrapper.style.backgroundSize = 'cover';
    wrapper.style.backgroundPosition = 'center';
    wrapper.style.backgroundRepeat = 'no-repeat';
    wrapper.classList.add('custom-placeholder-mode');
  }

  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);

  img.classList.add('lazy-loading');

  if (!customPlaceholder) {
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'lazy-placeholder-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '1.5');
    icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>';
    wrapper.appendChild(icon);
  }
}

function enqueueLoad(img) {
  loadQueue.push(img);
  processQueue();
}

function processQueue() {
  if (isLoading || loadQueue.length === 0) return;

  isLoading = true;
  var batch = loadQueue.splice(0, CONCURRENT_LOADS);
  var completed = 0;

  batch.forEach((img, idx) => {
    setTimeout(function() { 
      loadImage(img, function() {
        completed++;
        if (completed === batch.length) {
          isLoading = false;
          processQueue();
        }
      }); 
    }, idx * 100);
  });
}

function loadImage(img, callback) {
  var src = img.dataset.lazySrc || img.dataset.actualSrc;
  if (!src || img.classList.contains('lazy-loaded')) {
    if (callback) callback();
    return;
  }

  var loadingImg = new Image();

  loadingImg.onload = function() {
    img.src = src;
    img.removeAttribute('data-lazy-src');
    img.removeAttribute('data-lazy-processed');
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');

    var wrapper = img.closest('.lazy-load-wrapper');
    if (wrapper) {
      wrapper.classList.add('loaded');
      setTimeout(function() {
        if (wrapper.parentNode) {
          wrapper.parentNode.insertBefore(img, wrapper);
          wrapper.remove();
        }
        if (callback) callback();
      }, 350);
    } else {
      if (callback) callback();
    }
  };

  loadingImg.onerror = function() {
    console.warn('[LazyLoad] 图片加载失败:', src);
    img.src = img.dataset.actualSrc || src;
    img.removeAttribute('data-lazy-processed');
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
    img.classList.add('lazy-error');

    var wrapper = img.closest('.lazy-load-wrapper');
    if (wrapper) wrapper.remove();
    
    if (callback) callback();
  };

  loadingImg.src = src;
}

function fallbackLoadAll() {
  document.querySelectorAll('img[data-lazy-src]').forEach((img) => {
    var src = img.dataset.lazySrc;
    if (src) {
      img.src = src;
      img.removeAttribute('data-lazy-src');
      img.classList.add('lazy-loaded');
    }
  });
}
