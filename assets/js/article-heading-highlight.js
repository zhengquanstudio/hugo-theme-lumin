(function () {
  const CLASS_NAME = 'heading-highlight';

  const highlight = () => {
    if (!window.location.hash) return;
    let elem;
    try {
      elem = document.querySelector(decodeURIComponent(window.location.hash));
    } catch (e) {
      return;
    }
    if (!elem) return;
    elem.classList.remove(CLASS_NAME);
    requestAnimationFrame(() => {
      elem.classList.add(CLASS_NAME);
      setTimeout(() => {
        elem.classList.remove(CLASS_NAME);
      }, 2000);
    });
  };

  const init = () => {
    highlight();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('hashchange', highlight);
})();