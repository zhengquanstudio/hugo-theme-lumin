// 赞赏码交互功能
(function() {
  'use strict';

  const hasAppreciationElements = document.querySelector('[id*="appreciation"]');
  if (!hasAppreciationElements) return;

  let initAttempts = 0;
  const MAX_ATTEMPTS = 10;
  const RETRY_DELAY = 200;

  function initAppreciation() {
    initAttempts++;

    const toggleBtn = document.getElementById('appreciationToggle');
    const content = document.getElementById('appreciationContent');

    if (!toggleBtn || !content) {
      if (initAttempts < MAX_ATTEMPTS) {
        setTimeout(initAppreciation, RETRY_DELAY);
      }
      return;
    }

    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    newToggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const currentContent = document.getElementById('appreciationContent');
      const currentBtnText = newToggleBtn.querySelector('.appreciation-text');

      if (!currentContent) return;

      const isShowing = currentContent.classList.contains('show');

      if (isShowing) {
        currentContent.classList.remove('show');
        if (currentBtnText) currentBtnText.textContent = '打赏支持';
        setTimeout(function() {
          newToggleBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      } else {
        currentContent.classList.add('show');
        if (currentBtnText) currentBtnText.textContent = '下次一定';
        setTimeout(function() {
          currentContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }, { passive: false });
  }

  function tryInit() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(initAppreciation, 100);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initAppreciation, 100);
      });
    }

    window.addEventListener('load', function() {
      if (initAttempts === 0) {
        setTimeout(initAppreciation, 200);
      }
    });
  }

  tryInit();
})();
