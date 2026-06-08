/**
 * 广告轮播引擎
 * 处理 data-rotate-interval 属性的 .ad-rotate 容器
 * 通过添加/移除 .active class 实现轮播切换
 */
(function () {
  function initAdRotate() {
    const containers = document.querySelectorAll('.ad-rotate[data-rotate-interval]');
    containers.forEach(function (container) {
      if (container.dataset.adRotateInitialized) return;
      container.dataset.adRotateInitialized = '1';

      const items = container.querySelectorAll('.ad-item');
      if (items.length <= 1) return;

      const interval = parseInt(container.dataset.rotateInterval) || 5000;
      let currentIdx = 0;

      setInterval(function () {
        items[currentIdx].classList.remove('active');
        currentIdx = (currentIdx + 1) % items.length;
        items[currentIdx].classList.add('active');
      }, interval);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdRotate);
  } else {
    initAdRotate();
  }

  // Swup 页面切换后重新初始化
  if (typeof window.swupContentModules !== 'undefined') {
    window.swupContentModules.push(initAdRotate);
  }
})();
