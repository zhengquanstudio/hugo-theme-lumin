export function init() {
  var fab = document.getElementById('mobile-toc-fab');
  var overlay = document.getElementById('mobile-toc-overlay');
  var close = document.getElementById('mobile-toc-close');
  if (!fab || !overlay) return;

  var body = document.body;

  function openToc() {
    overlay.classList.add('active');
    body.style.overflow = 'hidden';
  }

  function closeToc() {
    overlay.classList.remove('active');
    body.style.overflow = '';
  }

  fab.addEventListener('click', openToc);
  close.addEventListener('click', closeToc);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeToc();
  });

  overlay.querySelectorAll('.mobile-toc-nav a').forEach(function(link) {
    link.addEventListener('click', function() {
      setTimeout(closeToc, 200);
    });
  });

  if (typeof window !== 'undefined' && window.Swup) {
    document.addEventListener('swup:contentReplaced', function() {
      var newFab = document.getElementById('mobile-toc-fab');
      var newOverlay = document.getElementById('mobile-toc-overlay');
      var newClose = document.getElementById('mobile-toc-close');
      if (!newFab || !newOverlay || !newClose) return;
      newFab.addEventListener('click', openToc);
      newClose.addEventListener('click', closeToc);
      newOverlay.addEventListener('click', function(e) {
        if (e.target === newOverlay) closeToc();
      });
      newOverlay.querySelectorAll('.mobile-toc-nav a').forEach(function(link) {
        link.addEventListener('click', function() {
          setTimeout(closeToc, 200);
        });
      });
    });
  }
}