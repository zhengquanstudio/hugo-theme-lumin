(function() {
  'use strict';

  const DEFAULT_WIDTH = 290;
  const MIN_WIDTH = 200;
  const MAX_WIDTH = 450;

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;
  let handle = null;
  let sidebar = null;
  let mainContent = null;

  function init() {
    sidebar = document.querySelector('.post-toc-sidebar');
    mainContent = document.querySelector('.main-content');
    
    if (!sidebar) {
      return;
    }

    createHandle();
    bindEvents();
  }

  function createHandle() {
    handle = document.createElement('div');
    handle.className = 'toc-resize-handle';
    handle.setAttribute('aria-label', '拖拽调整目录宽度');
    sidebar.appendChild(handle);
  }

  function bindEvents() {
    if (!handle) return;

    handle.addEventListener('mousedown', function(e) {
      isDragging = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;

      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;

      const deltaX = startX - e.clientX;
      let newWidth = startWidth + deltaX;
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));

      setTocWidth(newWidth);

      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mouseup', function() {
      if (!isDragging) return;

      isDragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

    handle.addEventListener('selectstart', function(e) {
      e.preventDefault();
    });
  }

  function setTocWidth(width) {
    sidebar.style.width = width + 'px';
    if (mainContent) {
      mainContent.style.marginRight = (width + 40) + 'px';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();