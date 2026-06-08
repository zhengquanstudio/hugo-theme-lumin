export function init() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var lastScrollY = 0;
  var ticking = false;
  var threshold = 60;

  function updateHeader() {
    var currentScrollY = window.scrollY || window.pageYOffset;

    if (currentScrollY > lastScrollY && currentScrollY > threshold) {
      header.classList.add('nav-hidden');
    } else {
      header.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
}
