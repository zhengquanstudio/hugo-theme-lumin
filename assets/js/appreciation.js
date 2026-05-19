// 赞赏码交互功能
(function() {
  // 快速预检查：如果页面没有打赏组件，直接退出整个脚本
  const hasAppreciationElements = document.querySelector('[id*="appreciation"]');
  if (!hasAppreciationElements) {
    // console.log('[Appreciation] No appreciation elements found on this page. Skipping initialization.');
    return;
  }

  console.log('[Appreciation] Script loaded at:', new Date().toISOString());

  let initAttempts = 0;
  const MAX_ATTEMPTS = 10;
  const RETRY_DELAY = 200;

  // 初始化函数
  function initAppreciation() {

    initAttempts++;
    console.log('[Appreciation] Initialization attempt:', initAttempts);
    console.log('[Appreciation] Document ready state:', document.readyState);
    console.log('[Appreciation] Body classes:', document.body?.className);

    const toggleBtn = document.getElementById('appreciationToggle');
    const content = document.getElementById('appreciationContent');

    console.log('[Appreciation] Toggle button found:', !!toggleBtn, toggleBtn);
    console.log('[Appreciation] Content element found:', !!content, content);

    // 如果元素不存在，尝试重试
    if (!toggleBtn || !content) {
      if (initAttempts < MAX_ATTEMPTS) {
        console.log(`[Appreciation] Elements not ready, retrying in ${RETRY_DELAY}ms...`);
        setTimeout(initAppreciation, RETRY_DELAY);
        return;
      } else {
        console.error('[Appreciation] Max retry attempts reached. Elements not found.');
        console.log('[Appreciation] Available elements with "appreciation":',
          document.querySelectorAll('[class*="appreciation"], [id*="appreciation"]));
        return;
      }
    }

    const btnText = toggleBtn.querySelector('.appreciation-text');
    console.log('[Appreciation] Button text element:', btnText);

    if (!btnText) {
      console.warn('[Appreciation] Button text not found, but continuing...');
    }

    // 移除可能的旧监听器（避免重复绑定）
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    // 点击按钮切换展开/收起状态
    newToggleBtn.addEventListener('click', function(e) {
      console.log('[Appreciation] Button clicked at:', new Date().toISOString());
      console.log('[Appreciation] Event:', e);
      console.log('[Appreciation] Current target:', e.currentTarget);

      e.preventDefault();  // 阻止默认行为
      e.stopPropagation(); // 阻止事件冒泡

      const currentContent = document.getElementById('appreciationContent');
      const currentBtnText = newToggleBtn.querySelector('.appreciation-text');

      if (!currentContent) {
        console.error('[Appreciation] Content element disappeared!');
        return;
      }

      const isShowing = currentContent.classList.contains('show');
      console.log('[Appreciation] Current state - isShowing:', isShowing);

      if (isShowing) {
        console.log('[Appreciation] Hiding content');
        currentContent.classList.remove('show');
        if (currentBtnText) currentBtnText.textContent = '打赏支持';
        // 平滑滚动回按钮
        setTimeout(() => {
          newToggleBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      } else {
        console.log('[Appreciation] Showing content');
        currentContent.classList.add('show');
        if (currentBtnText) currentBtnText.textContent = '下次一定';
        // 平滑滚动到内容区
        setTimeout(() => {
          currentContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }

      console.log('[Appreciation] After toggle - classes:', currentContent.className);
    }, { passive: false });

    console.log('[Appreciation] ✅ Event listener attached successfully');
    console.log('[Appreciation] ✅ Initialization complete');
  }

  // 多重初始化策略
  function tryInit() {
    console.log('[Appreciation] Starting initialization sequence...');

    // 策略1: 立即尝试
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log('[Appreciation] Strategy 1: Document already ready');
      setTimeout(initAppreciation, 100);
    }

    // 策略2: DOMContentLoaded
    if (document.readyState === 'loading') {
      console.log('[Appreciation] Strategy 2: Waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[Appreciation] DOMContentLoaded fired');
        setTimeout(initAppreciation, 100);
      });
    }

    // 策略3: window.onload 后备
    window.addEventListener('load', () => {
      console.log('[Appreciation] Window load event fired');
      if (initAttempts === 0) {
        console.log('[Appreciation] Strategy 3: Fallback to window.load');
        setTimeout(initAppreciation, 200);
      }
    });
  }

  tryInit();
})();
