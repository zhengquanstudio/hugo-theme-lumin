(function() {
  'use strict';

  var MOBILE_BREAKPOINT = 768;
  var INITIAL_SHOW = 8;
  var LOAD_STEP = 8;

  var currentVisible = 0;
  var totalArticles = 0;
  var isInitialized = false;

  function init() {
    if (isInitialized) return;

    var grid = document.querySelector('.article-grid');
    if (!grid) return;

    var initialShow = parseInt(grid.dataset.mobileInitialShow) || INITIAL_SHOW;
    var loadStep = parseInt(grid.dataset.mobileLoadMoreStep) || LOAD_STEP;

    var cards = grid.querySelectorAll(':scope > .article-card');
    totalArticles = cards.length;

    if (totalArticles <= initialShow + 2) {
      return;
    }

    createButton();
    applyMobileView(initialShow, loadStep);
    isInitialized = true;

    window.addEventListener('resize', debounce(function() {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        if (!document.querySelector('.mobile-load-more-container')) {
          createButton();
        }
        applyMobileView(initialShow, loadStep);
      } else {
        showAll();
      }
    }, 200));
  }

  function createButton() {
    if (document.querySelector('.mobile-load-more-container')) return;

    var container = document.createElement('div');
    container.className = 'mobile-load-more-container';
    container.innerHTML =
      '<button class="mobile-load-more-btn" id="mobile-load-more-trigger">' +
        '<span class="btn-text">加载更多</span>' +
        '<span class="btn-count"></span>' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</button>';

    var grid = document.querySelector('.article-grid');
    if (grid && grid.parentNode) {
      grid.parentNode.appendChild(container);
    }

    var btn = container.querySelector('#mobile-load-more-trigger');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleLoadMore(loadStep);
      });
    }
  }

  function applyMobileView(showCount, loadStep) {
    var cards = document.querySelectorAll('.article-grid > .article-card');

    if (currentVisible === 0) {
      currentVisible = Math.min(showCount, cards.length);
    }

    for (var j = 0; j < cards.length; j++) {
      if (j < currentVisible) {
        cards[j].classList.remove('mobile-hidden-card');
        cards[j].style.display = '';
      } else {
        cards[j].classList.add('mobile-hidden-card');
        cards[j].style.display = 'none';
      }
    }

    updateButton(loadStep);
    toggleContainer(true);
  }

  function showAll() {
    var cards = document.querySelectorAll('.article-grid > .article-card.mobile-hidden-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove('mobile-hidden-card');
      cards[i].style.display = '';
    }
    currentVisible = 0;
    toggleContainer(false);
  }

  function handleLoadMore(loadStep) {
    var hiddenCards = document.querySelectorAll('.article-grid > .article-card.mobile-hidden-card');
    var toShow = Math.min(loadStep, hiddenCards.length);

    if (toShow <= 0) return;

    var btn = document.querySelector('#mobile-load-more-trigger');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      var textEl = btn.querySelector('.btn-text');
      if (textEl) textEl.textContent = '加载中...';
    }

    for (var i = 0; i < toShow; i++) {
      (function(card, index) {
        setTimeout(function() {
          card.classList.remove('mobile-hidden-card');
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';

          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';

              setTimeout(function() {
                card.style.removeProperty('opacity');
                card.style.removeProperty('transform');
                card.style.removeProperty('transition');
              }, 350);
            });
          });
        }, index * 60);
      })(hiddenCards[i], i);
    }

    var totalTime = toShow * 60 + 450;

    setTimeout(function() {
      currentVisible += toShow;
      updateButton(loadStep);

      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        var textEl = btn.querySelector('.btn-text');
        if (textEl) textEl.textContent = '加载更多';
      }
    }, totalTime);
  }

  function updateButton(loadStep) {
    var container = document.querySelector('.mobile-load-more-container');
    if (!container) return;

    var btn = container.querySelector('#mobile-load-more-trigger');
    var countEl = container.querySelector('.btn-count');

    var remaining = totalArticles - currentVisible;

    if (remaining > 0) {
      if (btn) {
        btn.style.display = '';
      }
      if (countEl) {
        countEl.textContent = '(' + Math.min(loadStep, remaining) + ')';
      }
    } else {
      if (btn) {
        btn.style.display = 'none';
      }
      var tip = document.createElement('div');
      tip.className = 'mobile-all-loaded';
      tip.textContent = '已显示本页全部文章 (' + totalArticles + '篇)';
      container.appendChild(tip);
    }
  }

  function toggleContainer(show) {
    var container = document.querySelector('.mobile-load-more-container');
    if (container) {
      container.style.display = show ? '' : 'none';
    }
  }

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
