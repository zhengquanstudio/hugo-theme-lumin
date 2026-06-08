var initialized = false;

function wrapImages() {
  var containers = document.querySelectorAll('.post-content, .moment-content, .gallery-content');
  if (!containers.length) return;

  containers.forEach(function(container) {
    var imgs = container.querySelectorAll('img');
    imgs.forEach(function(img) {
      if (img.hasAttribute('data-fancybox')) return;
      if (!img.src || img.src.startsWith('data:')) return;

      var w = img.offsetWidth || img.width || 100;
      var h = img.offsetHeight || img.height || 100;
      if (w > 0 && w < 40 && h > 0 && h < 40) return;

      var realSrc = img.dataset.lazySrc || img.dataset.actualSrc || img.src;
      if (!realSrc) return;

      var a = document.createElement('a');
      a.href = realSrc;
      a.setAttribute('data-fancybox', 'gallery');
      a.setAttribute('data-caption', img.alt || '');
      a.style.cssText = 'display:inline-block;text-decoration:none;border-bottom:none;';

      var lazyWrapper = img.closest('.lazy-load-wrapper');
      if (lazyWrapper) {
        lazyWrapper.parentNode.insertBefore(a, lazyWrapper);
        a.appendChild(lazyWrapper);
      } else {
        img.parentNode.insertBefore(a, img);
        a.appendChild(img);
      }

      img.style.cursor = 'zoom-in';
    });
  });

  if (typeof Fancybox !== 'undefined') {
    Fancybox.bind('[data-fancybox]', {});
  }
}

function waitForFancybox(cb) {
  if (typeof Fancybox !== 'undefined') { cb(); return; }

  var retries = 0;
  var maxRetries = 30;
  var wait = setInterval(function() {
    retries++;
    if (typeof Fancybox !== 'undefined') {
      clearInterval(wait);
      cb();
    } else if (retries >= maxRetries) {
      clearInterval(wait);
    }
  }, 100);

  document.addEventListener('fancybox:ready', function handler() {
    document.removeEventListener('fancybox:ready', handler);
    clearInterval(wait);
    cb();
  }, { once: true });
}

export function init() {
  if (!document.querySelector('.post-content, .moment-content, .gallery-content')) return;

  if (typeof Fancybox !== 'undefined') {
    wrapImages();
  } else if (!initialized) {
    initialized = true;
    waitForFancybox(wrapImages);
  } else {
    waitForFancybox(wrapImages);
  }
}
