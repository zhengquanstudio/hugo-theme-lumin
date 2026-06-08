export function init() {
  var hint = document.getElementById('scroll-down-hint');
  if (!hint) return;
  hint.addEventListener('click', function() {
    var banner = document.getElementById('site-banner');
    if (banner) window.scrollTo({ top: banner.offsetHeight, behavior: 'smooth' });
  });
}
