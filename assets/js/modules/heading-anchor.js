function injectAnchors() {
  var container = document.querySelector('.post-content');
  if (!container) return;

  var headings = container.querySelectorAll('h2[id], h3[id], h4[id]');
  headings.forEach(function(h) {
    if (h.querySelector('.heading-anchor')) return;
    var anchor = document.createElement('a');
    anchor.href = '#' + h.id;
    anchor.className = 'heading-anchor';
    anchor.title = '复制链接';
    anchor.innerHTML = '#';
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      history.replaceState(null, '', '#' + h.id);
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#' + h.id).then(function() {
        anchor.textContent = '✓';
        anchor.style.color = '#16a34a';
        setTimeout(function() {
          anchor.textContent = '#';
          anchor.style.color = '';
        }, 1500);
      });
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    h.appendChild(anchor);
  });
}

export function init() {
  if (!document.querySelector('.post-content')) return;
  injectAnchors();

  if (typeof window !== 'undefined' && window.Swup) {
    document.addEventListener('swup:contentReplaced', injectAnchors);
  }
}