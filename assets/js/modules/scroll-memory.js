var STORAGE_KEY = 'scroll_positions';

function getPathKey() {
  return window.location.pathname;
}

function saveScrollPos() {
  try {
    var positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    positions[getPathKey()] = window.scrollY;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (e) {}
}

function restoreScrollPos() {
  try {
    var positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (!positions) return;
    var saved = positions[getPathKey()];
    if (saved && saved > 0) {
      window.scrollTo({ top: saved, behavior: 'instant' });
    }
  } catch (e) {}
}

var saveTimer = null;
function throttledSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(function() {
    saveScrollPos();
    saveTimer = null;
  }, 300);
}

export function init() {
  restoreScrollPos();

  window.addEventListener('scroll', throttledSave, { passive: true });
  window.addEventListener('beforeunload', saveScrollPos);
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) saveScrollPos();
  });

  if (typeof window !== 'undefined' && window.Swup) {
    document.addEventListener('swup:willReplaceContent', saveScrollPos);
    document.addEventListener('swup:contentReplaced', function() {
      setTimeout(restoreScrollPos, 100);
    });
  }
}