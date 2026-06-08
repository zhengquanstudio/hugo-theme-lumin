export function init() {
  document.addEventListener('keydown', function(e) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement && document.activeElement.isContentEditable) return;

    if (e.key === 'ArrowLeft' && e.altKey) {
      e.preventDefault();
      var prev = document.querySelector('.post-nav-item.prev');
      if (prev) prev.click();
    }

    if (e.key === 'ArrowRight' && e.altKey) {
      e.preventDefault();
      var next = document.querySelector('.post-nav-item.next');
      if (next) next.click();
    }

    if (e.key === 't' || e.key === 'T') {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
