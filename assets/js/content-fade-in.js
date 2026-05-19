(function() {
  'use strict';
  var selectors = ['.main-wrapper', '.single-post', '.post-content', '.page-content', '.list-container'];
  var el = null;
  for (var i = 0; i < selectors.length; i++) {
    el = document.querySelector(selectors[i]);
    if (el) break;
  }
  if (!el) return;

  el.classList.add('content-fade-wrapper');

  function triggerFadeIn() {
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.classList.add('fade-in');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerFadeIn);
  } else {
    triggerFadeIn();
  }
})();
